import React from "react";
import type { Seguimiento, TipoAccion, InsumoMejora } from "./useSeguimientos";

type Props = {
  value: Seguimiento;
  onChange: <K extends keyof Seguimiento>(key: K, value: Seguimiento[K]) => void;
};

export default function SeguimientoForm({ value, onChange }: Props) {
  return (
    <form className="space-y-3">
      {/* Nombre Entidad */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
        <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
          Nombre Entidad 
        </label>
        <div className="md:col-span-2">
          <input
            className="w-full"
            value={value.nombre_entidad}
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
            value={value.enlace_entidad}
            onChange={(e) => onChange("enlace_entidad", e.target.value)}
          />
        </div>
      </div>

      {/* Sección detalles con fieldset + legend */}
      <fieldset className="space-y-3 rounded-md border border-gray-300 p-3">
        <legend className="px-2 text-sm font-semibold text-gray-700">Detalles del seguimiento</legend>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Insumo de mejora
          </label>
          <div className="md:col-span-2">
            <select
              className="w-full"
              value={value.insumo_mejora}
              onChange={(e) => onChange("insumo_mejora", e.target.value as InsumoMejora)}
            >
              <option value="">-- Selecciona --</option>
              <option>Índice de Calidad a las Respuestas</option>
              <option>Peticiones Vencidas en el Sistema</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Tipo de acción de mejora
          </label>
          <div className="md:col-span-2">
            <select
              className="w-full"
              value={value.tipo_accion_mejora}
              onChange={(e) => onChange("tipo_accion_mejora", e.target.value as TipoAccion)}
            >
              <option value="">-- Selecciona --</option>
              <option>Preventiva</option>
              <option>Correctiva</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Acción de mejora planteada
          </label>
          <div className="md:col-span-2">
            <input
              className="w-full"
              value={value.accion_mejora_planteada}
              onChange={(e) => onChange("accion_mejora_planteada", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Descripción de las actividades
          </label>
          <div className="md:col-span-2">
            <textarea
              className="w-full min-h-28"
              value={value.descripcion_actividades}
              onChange={(e) => onChange("descripcion_actividades", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Evidencia de cumplimiento (URL)
          </label>
          <div className="md:col-span-2">
            <input
              className="w-full"
              value={value.evidencia_cumplimiento}
              onChange={(e) => onChange("evidencia_cumplimiento", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Fecha Inicio
          </label>
          <div className="md:col-span-2">
            <input
              type="date"
              className="w-full"
              required
              value={value.fecha_inicio}
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
              value={value.fecha_final}
              onChange={(e) => onChange("fecha_final", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">Seguimiento</label>
          <div className="md:col-span-2">
            <select
              className="w-full"
              value={value.seguimiento}
              onChange={(e) => onChange("seguimiento", e.target.value as any)}
            >
              <option>Pendiente</option>
              <option>En progreso</option>
              <option>Finalizado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Observación del informe de calidad
          </label>
          <div className="md:col-span-2">
            <textarea
              className="w-full min-h-28"
              value={value.observacion_informe_calidad}
              onChange={(e) => onChange("observacion_informe_calidad", e.target.value)}
            />
          </div>
        </div>
      </fieldset>
    </form>
  );
}
