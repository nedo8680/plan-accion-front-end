import React from "react";

import { useAuth } from "../../context/AuthContext";
import { uploadEvidence } from "../../lib/api";

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
  /** Para enfocar el primer input desde fuera (desktop) */
  focusRef?: React.RefObject<HTMLInputElement>;

  /// Acciones/toolbar abajo del form (p.ej. botones Enviar/Solicitar aprobación/Aprobar)
  footer?: React.ReactNode;
};

export default function SeguimientoForm({ value, onChange, readOnlyFields, topbar, header, focusRef, footer }: Props) {
  const ro = readOnlyFields ?? {};
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "admin";
  const isEntidad = role === "entidad";
  const isAuditor = role === "auditor";
  
  const MAX_UPLOAD_MB = 5;
  const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

  // Reglas de edición
  const canEditCamposEntidad = isAdmin || isEntidad;   // auditor: solo lectura en campos de entidad
  const canEditObsCalidad    = isAdmin || isAuditor;   // entidad: no puede editar observación de calidad

  // ID de seguimiento objetivo para las acciones (usa value.id; fallback plan_id si así lo manejas)
  const seguimientoId = value?.id ?? value?.plan_id;

  // Estado liviano para feedback
  const [busy, setBusy] = React.useState<false | "enviar" | "solicitar" | "aprobar">(false);
  const [msg, setMsg] = React.useState<string | null>(null); 
  const [eviUploading, setEviUploading] = React.useState(false);      
  const [eviError, setEviError] = React.useState<string | null>(null);

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
            ref={focusRef}
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
            disabled={!canEditCamposEntidad || !!ro["enlace_entidad"]}
            aria-disabled={!canEditCamposEntidad || !!ro["enlace_entidad"]}
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
              disabled={!canEditCamposEntidad || !!ro["insumo_mejora"]}
              aria-disabled={!canEditCamposEntidad || !!ro["insumo_mejora"]}
            >
              <option value="">-- Selecciona --</option>
              <option>Índice de Calidad a las Respuestas</option>
              <option>Peticiones Vencidas en el Sistema</option>
              <option>Monitoreos</option>
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
              disabled={!canEditCamposEntidad || !!ro["tipo_accion_mejora"]}
              aria-disabled={!canEditCamposEntidad || !!ro["tipo_accion_mejora"]}
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
              disabled={!canEditCamposEntidad || !!ro["accion_mejora_planteada"]}
              aria-disabled={!canEditCamposEntidad || !!ro["accion_mejora_planteada"]}
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
              disabled={!canEditCamposEntidad || !!ro["descripcion_actividades"]}
              aria-disabled={!canEditCamposEntidad || !!ro["descripcion_actividades"]}
            />
          </div>
        </div>

        {/* Evidencia (archivo) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-start">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Evidencia de cumplimiento
          </label>
          <div className="md:col-span-2 space-y-2">
            {/* Si ya hay evidencia guardada, mostramos visor  quitar */}
            {value.evidencia_cumplimiento ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <a
                  href={(value.evidencia_cumplimiento as string) || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm font-medium underline"
                >
                  Ver evidencia
                </a>
                {(isAdmin || isEntidad) && !ro["evidencia_cumplimiento"] && (
                  <button
                    type="button"
                    onClick={() => onChange("evidencia_cumplimiento", "")}
                    className="rounded-xl bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                  >
                    Quitar
                  </button>
                )}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={!canEditCamposEntidad || !!ro["evidencia_cumplimiento"] || eviUploading}
                  aria-disabled={!canEditCamposEntidad || !!ro["evidencia_cumplimiento"] || eviUploading}
                  onChange={async (e) => {
                    const inputEl = e.currentTarget;       
                    const file = inputEl.files?.[0];
                    if (!file) return;

                     if (file.size > MAX_UPLOAD_BYTES) {
                      setEviError(`El archivo supera ${MAX_UPLOAD_MB} MB. Reduce el tamaño y vuelve a intentar.`);
                      inputEl.value = "";
                      return;
                    }
                    try {
                      setEviError(null);
                      setEviUploading(true);
                      const { href } = await uploadEvidence(file);    
+                     onChange("evidencia_cumplimiento", href as any);
                    } catch (err: any) {
                      setEviError(err?.message || "Error subiendo evidencia");
                    } finally {
                      setEviUploading(false);
                      
                      try { if (inputEl) inputEl.value = ""; } catch {}
                    }
                  }}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-200 disabled:opacity-60"
                />
                {eviUploading && <p className="text-xs text-gray-500">Subiendo evidencia…</p>}
                {eviError && <p className="text-xs text-red-600">{eviError}</p>}
                <p className="text-xs text-gray-500">Formatos permitidos: PDF, DOC o DOCX.</p>
              </>
            )}
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
              disabled={!canEditCamposEntidad || !!ro["fecha_inicio"]}
              aria-disabled={!canEditCamposEntidad || !!ro["fecha_inicio"]}
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
              disabled={!canEditCamposEntidad || !!ro["fecha_final"]}
              aria-disabled={!canEditCamposEntidad || !!ro["fecha_final"]}
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
              disabled={!canEditCamposEntidad || !!ro["seguimiento"]}
              aria-disabled={!canEditCamposEntidad || !!ro["seguimiento"]}
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
              disabled={!canEditObsCalidad || !!ro["observacion_calidad"]}
              aria-disabled={!canEditObsCalidad || !!ro["observacion_calidad"]}
              className={`w-full min-h-24 ${
                (!canEditObsCalidad || !!ro["observacion_calidad"]) ? "opacity-60" : ""
              }`}
            />
          </div>
        </div>
      </fieldset>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </form>
  );
}
