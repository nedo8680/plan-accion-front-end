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
  indicador?: string | null;
  fecha_reporte?: string | null;
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
  planActions?: React.ReactNode;
};

export default function SeguimientoForm({
  value,
  onChange,
  readOnlyFields,
  topbar,
  header,
  focusRef,
  footer,
  planActions,
}: Props) {
  const ro = readOnlyFields ?? {};
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "admin";
  const isEntidad = role === "entidad";
  const isAuditor = role === "auditor";

  const MAX_UPLOAD_MB = 5;
  const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

  // Reglas de edición
  const canEditCamposEntidad = isAdmin || isEntidad; // auditor: solo lectura en campos de entidad
  const canEditObsCalidad = isAdmin || isAuditor; // entidad: no puede editar observación de calidad

  const isSeguimiento = Boolean(value.plan_id);
  const isNuevoPlan = !value.id && !value.plan_id;     // solo al crear por primera vez

  // Bloque Plan: solo editable cuando estás creando el primer registro
  const canEditPlanBlock = canEditCamposEntidad && isNuevoPlan;

  // Nombre / Enlace entidad: solo editables en la primera creación (ni en plan ya guardado ni en seguimientos)
  const canEditNombreEntidad = canEditCamposEntidad && isNuevoPlan;
  const canEditEnlaceEntidad = canEditCamposEntidad && isNuevoPlan;


  // Estado liviano para feedback
  const [eviUploading, setEviUploading] = React.useState(false);
  const [eviError, setEviError] = React.useState<string | null>(null);

  const todayStr = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  React.useEffect(() => {
    if (isSeguimiento && !value.fecha_reporte) {
      const created = (value as any).created_at?.slice(0, 10);
      const initial = created || todayStr;
      onChange("fecha_reporte" as any, initial);
    }
  }, [isSeguimiento, value.fecha_reporte, (value as any).created_at, onChange, todayStr]);


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
            disabled={!canEditNombreEntidad || !!ro["nombre_entidad"]}
            aria-disabled={!canEditNombreEntidad || !!ro["nombre_entidad"]}
          />
        </div>
      </div>

      {/* Enlace de la entidad */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
        <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
          Enlace de la entidad (funcionario responsable)
        </label>
        <div className="md:col-span-2">
          <input
            className="w-full"
            value={value.enlace_entidad ?? ""}
            onChange={(e) => onChange("enlace_entidad", e.target.value)}
            disabled={!canEditEnlaceEntidad || !!ro["enlace_entidad"]}
            aria-disabled={!canEditEnlaceEntidad || !!ro["enlace_entidad"]}
          />
        </div>
      </div>

      {/* ===== Plan de mejoramiento ===== */}

      <fieldset className="space-y-3 rounded-md border border-gray-300 p-3">
        <legend className="px-2 text-sm font-semibold text-gray-700">
          Plan de mejoramiento
        </legend>

        {/* Indicador */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Indicador
          </label>
          <div className="md:col-span-2">
            <input
              className="w-full"
              value={value.indicador ?? ""}
              onChange={(e) => onChange("indicador", e.target.value)}
              disabled={!canEditPlanBlock || !!ro["indicador"]}
              aria-disabled={!canEditPlanBlock || !!ro["indicador"]}
            />
          </div>
        </div>

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
              disabled={!canEditPlanBlock || !!ro["insumo_mejora"]}
              aria-disabled={!canEditPlanBlock || !!ro["insumo_mejora"]}
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
              disabled={!canEditPlanBlock || !!ro["tipo_accion_mejora"]}
              aria-disabled={!canEditPlanBlock || !!ro["tipo_accion_mejora"]}
            >
              <option value="">-- Selecciona --</option>
              <option>Preventiva</option>
              <option>Correctiva</option>
            </select>
          </div>
        </div>
        {/* Acción recomendada (usa observacion_informe_calidad) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Acción recomendada
          </label>
          <div className="md:col-span-2">
            <textarea
              className="w-full min-h-24"
              value={value.observacion_informe_calidad ?? ""}
              onChange={(e) =>
                onChange("observacion_informe_calidad", e.target.value)
              }
              disabled={!canEditPlanBlock || !!ro["observacion_informe_calidad"]}
              aria-disabled={
                !canEditPlanBlock || !!ro["observacion_informe_calidad"]
              }
            />
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
              disabled={!canEditPlanBlock || !!ro["accion_mejora_planteada"]}
              aria-disabled={!canEditPlanBlock || !!ro["accion_mejora_planteada"]}
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
              disabled={!canEditPlanBlock || !!ro["descripcion_actividades"]}
              aria-disabled={!canEditPlanBlock || !!ro["descripcion_actividades"]}
            />
          </div>
        </div>

        {/* Descripción de la evidencia de cumplimiento de la acción */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
              Descripción de la evidencia de cumplimiento de la acción
            </label>
            <div className="md:col-span-2">
              <textarea
                className="w-full min-h-28"
                value={value.evidencia_cumplimiento ?? ""}
                onChange={(e) => onChange("evidencia_cumplimiento", e.target.value)}
                disabled={!canEditPlanBlock || !!ro["evidencia_cumplimiento"]}
                aria-disabled={!canEditPlanBlock || !!ro["evidencia_cumplimiento"]}
              />
              <p className="mt-1 text-xs text-gray-500">
                Describe brevemente las evidencias de cumplimiento previstas para esta acción.
              </p>
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
              disabled={!canEditPlanBlock || !!ro["fecha_inicio"]}
              aria-disabled={!canEditPlanBlock || !!ro["fecha_inicio"]}
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
              disabled={!canEditPlanBlock || !!ro["fecha_final"]}
              aria-disabled={!canEditPlanBlock || !!ro["fecha_final"]}
            />
          </div>
        </div>

        {/* Observación del equipo de la DDCS (desde seguimientos, solo lectura) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Observación del equipo de la DDCS
          </label>
          <div className="md:col-span-2">
            <textarea
              className="w-full min-h-24 bg-gray-50"
              value={value.observacion_calidad ?? ""}
              readOnly
              disabled
              aria-disabled
            />
            <p className="mt-1 text-xs text-gray-500">
              Esta observación la registra el equipo de la DDCS en los
              seguimientos.
            </p>
          </div>
        </div>
        
      </fieldset>
      {planActions && (
        <div className="mt-4 flex justify-end gap-2">
          {planActions}
        </div>
      )}

      {/* ===== Seguimiento a las acciones del Plan de mejoramiento ===== */}
      {isSeguimiento && (
        <fieldset className="mt-4 space-y-3 rounded-md border border-gray-300 p-3">
          {/* Tabs de seguimientos */}
          {header && <div className="mb-4">{header}</div>}
          
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Seguimiento a las acciones del Plan de mejoramiento
          </legend>

        {/* Fecha de reporte (editable, min = fecha de creación o hoy) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Fecha de reporte
          </label>
          <div className="md:col-span-2">
            <input
              type="date"
              className="w-full"
              value={value.fecha_reporte ?? ""}
              min={(value as any).created_at?.slice(0, 10) ?? todayStr}
              onChange={(e) => {
                const v = e.target.value;
                const min = (value as any).created_at?.slice(0, 10) ?? todayStr;
                if (v && v < min) return; // evitamos fechas anteriores
                onChange("fecha_reporte" as any, v);
              }}
              disabled={!canEditCamposEntidad || !!ro["fecha_reporte"]}
              aria-disabled={!canEditCamposEntidad || !!ro["fecha_reporte"]}
            />
          </div>
        </div>

        {/* Nombre Entidad (desde el plan, solo lectura) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Nombre Entidad
          </label>
          <div className="md:col-span-2">
            <input
              className="w-full bg-gray-50"
              value={value.nombre_entidad || ""}
              readOnly
              disabled
              aria-disabled
            />
          </div>
        </div>

        {/* Enlace entidad (funcionario responsable, desde el plan, solo lectura) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
          <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Enlace entidad (funcionario responsable)
          </label>
          <div className="md:col-span-2">
            <input
              className="w-full bg-gray-50"
              value={value.enlace_entidad ?? ""}
              readOnly
              disabled
              aria-disabled
            />
          </div>
        </div>



          {/* Acción de mejora planteada (Plan) como referencia */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
              Acción de mejora planteada (Plan)
            </label>
            <div className="md:col-span-2">
              <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800">
                {value.accion_mejora_planteada || "Sin información"}
              </p>
            </div>
          </div>

          {/* Actividades realizadas en el periodo */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
              Actividades realizadas en el periodo
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

          {/* Evidencias de cumplimiento de la acción (archivo) */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-start">
            <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
              Evidencias de cumplimiento de la acción
            </label>
            <div className="md:col-span-2 space-y-2">
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
                    disabled={
                      !canEditCamposEntidad ||
                      !!ro["evidencia_cumplimiento"] ||
                      eviUploading
                    }
                    aria-disabled={
                      !canEditCamposEntidad ||
                      !!ro["evidencia_cumplimiento"] ||
                      eviUploading
                    }
                    onChange={async (e) => {
                      const inputEl = e.currentTarget;
                      const file = inputEl.files?.[0];
                      if (!file) return;

                      if (file.size > MAX_UPLOAD_BYTES) {
                        setEviError(
                          `El archivo supera ${MAX_UPLOAD_MB} MB. Reduce el tamaño y vuelve a intentar.`
                        );
                        inputEl.value = "";
                        return;
                      }
                      try {
                        setEviError(null);
                        setEviUploading(true);
                        const { href } = await uploadEvidence(file);
                        onChange("evidencia_cumplimiento", href as any);
                      } catch (err: any) {
                        setEviError(err?.message || "Error subiendo evidencia");
                      } finally {
                        setEviUploading(false);
                        try {
                          if (inputEl) inputEl.value = "";
                        } catch {}
                      }
                    }}
                    className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-200 disabled:opacity-60"
                  />
                  {eviUploading && (
                    <p className="text-xs text-gray-500">Subiendo evidencia…</p>
                  )}
                  {eviError && (
                    <p className="text-xs text-red-600">{eviError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Formatos permitidos: PDF, DOC o DOCX.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Estado de seguimiento */}
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

          {/* Observación del equipo de la DDCS */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
              Observación del equipo de la DDCS
            </label>
            <div className="md:col-span-2">
              <textarea
                name="observacion_calidad"
                value={value.observacion_calidad ?? ""}
                onChange={(e) => onChange("observacion_calidad", e.target.value)}
                disabled={!canEditObsCalidad || !!ro["observacion_calidad"]}
                aria-disabled={!canEditObsCalidad || !!ro["observacion_calidad"]}
                className={`w-full min-h-24 ${
                  (!canEditObsCalidad || !!ro["observacion_calidad"])
                    ? "opacity-60"
                    : ""
                }`}
              />
            </div>
          </div>
        </fieldset>
      )}

      {footer && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {footer}
        </div>
      )}
    </form>
  );
}
