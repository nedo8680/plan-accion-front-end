import React from "react";

type TipoAccion = "Preventiva" | "Correctiva" | "";
type InsumoMejora =
  | "Índice de Calidad a las Respuestas"
  | "Peticiones Vencidas en el Sistema"
  | "";

type UnifiedFormValue = {
  nombre_entidad: string;
  enlace_entidad?: string | null;

  observacion_informe_calidad?: string | null;

  id?: number;
  plan_id?: number;
  insumo_mejora?: InsumoMejora | string | null;
  tipo_accion_mejora?: TipoAccion | string | null;
  accion_mejora_planteada?: string | null;
  descripcion_actividades?: string | null;
  evidencia_cumplimiento?: string | null;
  fecha_inicio?: string | null;
  fecha_final?: string | null;
  seguimiento?: "Pendiente" | "En progreso" | "Finalizado" | string | null;

  observacion_calidad?: string | null;
};

type Props = {
  value: UnifiedFormValue;
  onChange: <K extends keyof UnifiedFormValue>(key: K, value: UnifiedFormValue[K]) => void;
  readOnlyFields?: Record<string, boolean>;

  /** Acciones/toolbar arriba del form (p.ej. Borrar plan) */
  topbar?: React.ReactNode;

  /** Acciones dentro de "Detalles del seguimiento" (tabs Agregar/Borrar seguimiento) */
  header?: React.ReactNode;
};

export default function SeguimientoForm({ value, onChange, readOnlyFields, topbar, header }: Props) {
  const ro = readOnlyFields ?? {};

  return (
    <form className="space-y-3">
      {/* ===== Toolbar superior (ej. Borrar plan) ===== */}
      {topbar && (
        <div className="mb-3 flex items-center justify-end gap-2">
          {topbar}
        </div>
      )}

      {/* Nombre Entidad */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
        <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
          Nombre Entidad
        </label>
        <div className="md:col-span-2">
          <input
            className="w-full"
            value={value.nombre_entidad || ""}
            onChange={(e) => onChange("nombre_entidad", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Enlace de la entidad */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
        <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
          Enlace de la entidad
        </label>
        <div className="md:col-span-2">
          <input
            className="w-full"
            value={value.enlace_entidad ?? ""}
            onChange={(e) => onChange("enlace_entidad", e.target.value)}
          />
        </div>
      </div>

      {/* ===== Detalles del seguimiento ===== */}
      <fieldset className="space-y-3 rounded-md border border-gray-300 p-3">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Detalles del seguimiento
        </legend>

        {/* Header interno (tabs + agregar/borrar seguimiento) */}
        {header && <div className="mb-4">{header}</div>}

        {/* Insumo de mejora */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Insumo de mejora
          </label>
          <div className="md:col-span-2">
            <select
              className="w-full"
              value={value.insumo_mejora ?? ""}
              onChange={(e) => onChange("insumo_mejora", e.target.value as InsumoMejora)}
            >
              <option value="">-- Selecciona --</option>
              <option>Índice de Calidad a las Respuestas</option>
              <option>Peticiones Vencidas en el Sistema</option>
            </select>
          </div>
        </div>

        {/* Tipo de acción de mejora */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Tipo de acción de mejora
          </label>
          <div className="md:col-span-2">
            <select
              className="w-full"
              value={value.tipo_accion_mejora ?? ""}
              onChange={(e) => onChange("tipo_accion_mejora", e.target.value as TipoAccion)}
            >
              <option value="">-- Selecciona --</option>
              <option>Preventiva</option>
              <option>Correctiva</option>
            </select>
          </div>
        </div>

        {/* Acción de mejora planteada */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Acción de mejora planteada
          </label>
          <div className="md:col-span-2">
            <input
              className="w-full"
              value={value.accion_mejora_planteada ?? ""}
              onChange={(e) => onChange("accion_mejora_planteada", e.target.value)}
            />
          </div>
        </div>

        {/* Descripción de las actividades */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Descripción de las actividades
          </label>
          <div className="md:col-span-2">
            <textarea
              className="w-full min-h-28"
              value={value.descripcion_actividades ?? ""}
              onChange={(e) => onChange("descripcion_actividades", e.target.value)}
            />
          </div>
        </div>

        {/* Evidencia */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Evidencia de cumplimiento (URL)
          </label>
          <div className="md:col-span-2">
            <input
              className="w-full"
              value={value.evidencia_cumplimiento ?? ""}
              onChange={(e) => onChange("evidencia_cumplimiento", e.target.value)}
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Fecha Inicio
          </label>
          <div className="md:col-span-2">
            <input
              type="date"
              className="w-full"
              required
              value={value.fecha_inicio ?? ""}
              onChange={(e) => onChange("fecha_inicio", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Fecha Final
          </label>
          <div className="md:col-span-2">
            <input
              type="date"
              className="w-full"
              value={value.fecha_final ?? ""}
              onChange={(e) => onChange("fecha_final", e.target.value)}
            />
          </div>
        </div>

        {/* Estado */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Seguimiento
          </label>
          <div className="md:col-span-2">
            <select
              className="w-full"
              value={value.seguimiento ?? "Pendiente"}
              onChange={(e) => onChange("seguimiento", e.target.value as any)}
            >
              <option>Pendiente</option>
              <option>En progreso</option>
              <option>Finalizado</option>
            </select>
          </div>
        </div>

        {/* Observación auditor/admin */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Observación del informe de calidad
          </label>
          <div className="md:col-span-2">
            <textarea
              name="observacion_calidad"
              value={value.observacion_calidad ?? ""}
              onChange={(e) => onChange("observacion_calidad", e.target.value)}
              disabled={!!ro["observacion_calidad"]}
              className={`w-full min-h-24 ${ro["observacion_calidad"] ? "opacity-60" : ""}`}
            />
          </div>
        </div>
      </fieldset>
    </form>
  );
}
