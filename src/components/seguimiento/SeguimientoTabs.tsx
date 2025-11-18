import React from "react";
import type { Seguimiento } from "./useSeguimientos";

type Props = {
  items: Seguimiento[];
  activeId?: number | null;
  onSelect: (id: number) => void;
  onAdd?: () => void;
  onDelete?: () => void;       // borrar seguimiento activo
  onDeletePlan?: () => void;   // borrar plan activo
  canAdd?: boolean;
  canDelete?: boolean;
  canDeletePlan?: boolean;
  hideActions?: boolean;
};

export default function SeguimientoTabs({
  items,
  activeId,
  onSelect,
  onAdd,
  onDelete,
  onDeletePlan,
  canAdd = false,
  canDelete = false,
  canDeletePlan = false,
  hideActions = false,        
}: Props) {
  const hasItems = items.length > 0;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Izquierda: tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {!hasItems ? (
            <span className="text-sm text-gray-500">Sin seguimientos</span>
          ) : (
            items.map((s, idx) => {
              const id = s.id!;
              const isActive = id === activeId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  className={[
                    "rounded-full px-3 py-1 text-sm transition",
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {`Seguimiento ${idx + 1}`}
                </button>
              );
            })
          )}
        </div>

        {/* Derecha: acciones (se pueden ocultar) */}
        {!hideActions && (
          <div className="flex items-center gap-2">
            {/* Agregar seguimiento */}
            <button
              type="button"
              onClick={onAdd}
              disabled={!canAdd}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${
                canAdd ? "bg-emerald-600 hover:bg-emerald-700" : "bg-emerald-300 cursor-not-allowed"
              }`}
            >
              Agregar seguimiento
            </button>

            {/* Borrar seguimiento activo */}
            <button
              type="button"
              onClick={onDelete}
              disabled={!canDelete || !activeId}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${
                canDelete && activeId ? "bg-amber-600 hover:bg-amber-700" : "bg-amber-300 cursor-not-allowed"
              }`}
            >
              Borrar seguimiento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
