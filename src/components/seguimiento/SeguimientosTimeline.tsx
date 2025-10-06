import React from "react";
import type { Seguimiento } from "./useSeguimientos";
import { FiClock, FiUser } from "react-icons/fi";

type Props = {
  items: Seguimiento[];
  activeId?: number | null;
  onSelect: (id: number) => void;
};

function parseISOAssumeUTC(raw: string): Date {
  const s = raw.trim().replace(" ", "T");
  if (/[zZ]$/.test(s) || /[+\-]\d{2}:\d{2}$/.test(s)) return new Date(s);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return new Date(`${s}:00Z`);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) return new Date(`${s}Z`);
  return new Date(`${s}Z`);
}
function fmtBogota(s?: string | null) {
  if (!s) return "—";
  const d = parseISOAssumeUTC(s);
  if (isNaN(d.getTime())) return s;
  const f = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = f.formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === t)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
      {children}
    </span>
  );
}

export default function SeguimientosTimeline({ items, activeId, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-4 text-center text-sm text-gray-500">
        Aún no hay seguimientos en este plan.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((s, i) => {
        const isActive = s.id === activeId;
        const last = s.updated_at ?? (s as any).updatedAt ?? s.created_at ?? (s as any).createdAt ?? null;
        const updatedBy = s.updated_by_email ?? "";
        return (
          <div
            key={s.id ?? `seg-${i}`}
            className={[
              "rounded-xl border bg-white p-3 shadow-sm transition",
              isActive ? "ring-2 ring-blue-500" : "hover:shadow"
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">Seguimiento {i + 1}</div>
                  <Pill>{s.seguimiento ?? "Pendiente"}</Pill>
                </div>
                {/* Badge verde con fecha  email */}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800"
                    title="Última actualización"
                  >
                    <FiClock className="h-3.5 w-3.5" />
                    <span>Última actualización: {fmtBogota(last)}</span>
                  </span>
                  {updatedBy &&
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700"
                    title="Actualizado por"
                  >
                    Por:
                    <FiUser className="h-3.5 w-3.5" />
                    <span>{updatedBy}</span>
                  </span>
                  }
                </div>
              </div>

              {s.id && (
                <button
                  type="button"
                  onClick={() => onSelect(s.id!)}
                  className="rounded-lg bg-[#D32D37] px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Editar
                </button>
              )}
            </div>

            {(s.accion_mejora_planteada || s.descripcion_actividades) && (
              <div className="mt-2 text-sm text-gray-700">
                {s.accion_mejora_planteada && (
                  <div><span className="text-gray-500">Acción:</span> {s.accion_mejora_planteada}</div>
                )}
                {s.descripcion_actividades && (
                  <div><span className="text-gray-500">Descripción:</span> {s.descripcion_actividades}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
