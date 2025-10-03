import React, { useMemo, useState } from "react";
import type { Plan } from "./useSeguimientos";

type Props = {
  plans: Plan[];
  activePlanId: number | null;
  onSelect: (id: number) => void;
};

export default function PlanesSidebar({ plans, activePlanId, onSelect }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return plans;
    return plans.filter(
      (p) =>
        p.nombre_entidad?.toLowerCase().includes(s) ||
        p.num_plan_mejora?.toLowerCase().includes(s)
    );
  }, [q, plans]);

  return (
    <aside className="sticky top-4 h-fit rounded-xl border bg-white p-3 shadow-sm">
      <div className="mb-2">
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Buscar planes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="max-h-[70vh] overflow-auto pr-1">
        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-gray-500">
            Sin resultados
          </div>
        )}

        <ul className="space-y-1">
          {filtered.map((p) => {
            const active = p.id === activePlanId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={[
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                    active
                      ? "bg-yellow-400 text-gray-800"
                      : "hover:bg-gray-100 text-gray-800",
                  ].join(" ")}
                >
                  <div className="font-medium">
                    {p.nombre_entidad || "—"}
                  </div>
                  <div className="text-xs opacity-80">
                    {p.enlace_entidad ?? ""}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
