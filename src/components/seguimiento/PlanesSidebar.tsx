import React, { useMemo, useState } from "react";
import type { Plan } from "./useSeguimientos";
import { BsSortUpAlt,  BsSortDown } from "react-icons/bs";

type Filters = {
  createdOrder: "asc" | "desc";
  toggleCreatedOrder: () => void;
};

type Props = {
  plans: Plan[];
  activePlanId: number | null;
  onSelect: (id: number) => void;

  count?: number;
  createdOrder: "asc" | "desc";
  toggleCreatedOrder: () => void;
};

export default function PlanesSidebar({
  plans,
  activePlanId,
  onSelect,
  count,
  createdOrder,
  toggleCreatedOrder,
}: Props) {
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
<aside className="sticky top-4 h-fit rounded-xl border bg-white p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Planes</h3>
        <button
          type="button"
          onClick={toggleCreatedOrder}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
          title={createdOrder === "asc" ? "Ordenar: desde la última" : "Ordenar: desde la primera"}
          aria-label="Alternar orden por fecha de creación"
        >
          {createdOrder === "asc" ? (
            <>
              <BsSortUpAlt className="text-base" />
            </>
          ) : (
            <>
              <BsSortDown className="text-base" />
            </>
          )}
        </button>
      </div>
      {/* Buscador local */}
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
