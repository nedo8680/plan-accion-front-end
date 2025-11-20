import React from "react";
import { FiInfo } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { uploadEvidence } from "../../lib/api";

type TipoAccion = "Preventiva" | "Correctiva" | "";
type InsumoMejora =
  | "Índice de Calidad a las Respuestas"
  | "Peticiones Vencidas en el Sistema"
  | "";
type IndicadorApiRow = {
  entidad?: string;
  indicador?: string;
  accion?: string;
};

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
  plan_descripcion_actividades?: string | null;
  plan_evidencia_cumplimiento?: string | null;
  fecha_inicio?: string | null;
  fecha_final?: string | null;
  seguimiento?: "Pendiente" | "En progreso" | "Finalizado" | string | null;

  observacion_calidad?: string | null;
  indicador?: string | null;
  fecha_reporte?: string | null;

  estado?: string | null; // "Borrador" | "Pendiente" | ...
};

type Props = {
  value: UnifiedFormValue;
  onChange: <K extends keyof UnifiedFormValue>(key: K, value: UnifiedFormValue[K]) => void;
  readOnlyFields?: Record<string, boolean>;

  topbar?: React.ReactNode;
  header?: React.ReactNode;
  focusRef?: React.RefObject<HTMLInputElement>;
  footer?: React.ReactNode;
  indicadoresApi?: IndicadorApiRow[];
  usedIndicadores?: string[];
  planActions?: React.ReactNode;
  onRequestNewPlanFromAction?: (accion: string) => void;
};

export default function SeguimientoForm({
  value,
  onChange,
  readOnlyFields,
  topbar,
  header,
  focusRef,
  footer,
  indicadoresApi,
  planActions,
  onRequestNewPlanFromAction,
  usedIndicadores,
}: Props) {
  const ro = readOnlyFields ?? {};
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "admin";
  const isEntidad = role === "entidad";
  const isAuditor = role === "auditor";

  const anyUser = user as any;
  const entidadFromUser = (anyUser?.entidad || "").trim();

  const MAX_DESC_ACTIVIDADES = 300;
  const MAX_PLAN_EVIDENCIA = 300;
  const MAX_OBS_DDCS = 300;
  const MAX_OBS_DDCS_SEG = 300;

  const MAX_UPLOAD_MB = 5;
  const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

  // ===== Reglas de edición a partir de rol y estado =====
  const canEditCamposEntidad = isAdmin || isEntidad;
  const canEditObsCalidad = isAdmin || isAuditor;

  const isSeguimientoBase = Boolean(value.plan_id);
  const estadoPlan = value.estado ?? "Pendiente";
  const hasSeguimientoActual = Boolean(value.id) || Boolean(value.fecha_reporte);

  // Solo consideramos verdaderamente “Borrador” cuando aún no hay seguimiento creado
  const isDraft = estadoPlan === "Borrador" && !hasSeguimientoActual;

  const canEditObsCalidadPlan = (isAdmin || isAuditor) && !isDraft;

  // Bloque de seguimiento solo si hay plan y NO está en borrador
  const isSeguimientoVisible = isSeguimientoBase && !isDraft;

  const estadoSeguimiento = (value.seguimiento as string) || "Pendiente";

  const isBloqueadoEntidadSeguimiento =
    isEntidad && isSeguimientoVisible && estadoSeguimiento !== "Pendiente";

  const canEditCamposEntidadSeguimiento =
    (isAdmin || isEntidad) && !isBloqueadoEntidadSeguimiento;

  const canEditSeguimientoEstado = isAdmin || isAuditor;

  // Bloque Plan: editable mientras el plan esté en Borrador
  const canEditPlanBlock = canEditCamposEntidad && isDraft;
  const canEditNombreEntidad = false;
  const canEditEnlaceEntidad = canEditCamposEntidad && isDraft;

  // Estado liviano para feedback de upload
  const [eviUploading, setEviUploading] = React.useState(false);
  const [eviError, setEviError] = React.useState<string | null>(null);
  const [eviHelpOpen, setEviHelpOpen] = React.useState(false);
  const eviHelpRef = React.useRef<HTMLDivElement | null>(null);
  const hasIndicadoresApi = indicadoresApi && indicadoresApi.length > 0;

  // 👇 NUEVO: saber si el plan ya existe en BD
  const hasPlanPersisted = Boolean(value.plan_id);

  // 👇 NUEVO: regla específica para habilitar el select de indicador
  const canEditIndicador =
    hasIndicadoresApi &&
    !hasPlanPersisted && // si ya hay plan_id, no se puede cambiar el indicador
    canEditPlanBlock &&
    !ro["indicador"];

  const handleIndicadorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const indicadorValue = e.target.value;

    // Actualizar el campo indicador en el form
    onChange("indicador" as any, indicadorValue);

    // Buscar la fila correspondiente
    const row = indicadoresApi?.find((r) => r.indicador === indicadorValue);

    if (row) {
      // Rellenar automáticamente la acción de mejora
      if (row.accion) {
        onChange("observacion_informe_calidad", row.accion);
      }

      // Opcional: también actualizar nombre_entidad
      if (row.entidad) {
        onChange("nombre_entidad", row.entidad);
      }
    }
  };

  const todayStr = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  // nombre_entidad desde el usuario cuando el rol es entidad
  React.useEffect(() => {
    if (!entidadFromUser) return;

    const current = (value.nombre_entidad || "").trim();
    if (!current) {
      onChange("nombre_entidad", entidadFromUser);
    }
  }, [entidadFromUser, value.nombre_entidad, onChange]);

  // Fecha de reporte (solo cuando el bloque seguimiento está visible)
  React.useEffect(() => {
    if (isSeguimientoVisible && !value.fecha_reporte) {
      const created = (value as any).created_at?.slice(0, 10);
      const initial = created || todayStr;
      onChange("fecha_reporte" as any, initial);
    }
  }, [isSeguimientoVisible, value.fecha_reporte, (value as any).created_at, onChange, todayStr]);

  // Aviso inteligente para múltiples acciones
  const multiActionCount = React.useMemo(() => {
    const raw = value.accion_mejora_planteada ?? "";
    const parts = raw
      .split(/[\n;,.]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    return parts.length;
  }, [value.accion_mejora_planteada]);

  const hasMultipleActions = multiActionCount >= 2 && isDraft;

  const usedIndicadoresSet = React.useMemo(
    () => new Set((usedIndicadores ?? []).filter(Boolean)),
    [usedIndicadores]
  );

  // Cerrar tooltip de ayuda si se hace click fuera
  React.useEffect(() => {
    if (!eviHelpOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (eviHelpRef.current && !eviHelpRef.current.contains(event.target as Node)) {
        setEviHelpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [eviHelpOpen]);

    // Auto-seleccionar el primer indicador disponible (no usado) en nuevos planes
  React.useEffect(() => {
    // Si no hay indicadores o no vienen del backend, no hacemos nada
    if (!hasIndicadoresApi || !indicadoresApi || indicadoresApi.length === 0) return;

    // Si el plan ya existe en BD, no tocamos el indicador (ya está fijado)
    if (value.plan_id) return;

    const current = (value.indicador || "").trim();

    // Si ya hay un indicador y NO está marcado como usado, lo dejamos tal cual
    if (current && !usedIndicadoresSet.has(current)) {
      return;
    }

    // Buscar el primer indicador NO usado
    const nextRow = indicadoresApi.find((row) => {
      const val = (row.indicador || "").trim();
      if (!val) return false;
      return !usedIndicadoresSet.has(val);
    });

    if (!nextRow || !nextRow.indicador) return;

    // Si es igual al que ya tiene, no hacemos nada
    if (nextRow.indicador === current) return;

    // Asignar automáticamente el indicador disponible
    onChange("indicador", nextRow.indicador);

    // Opcional: replicamos la lógica del select para rellenar acción y entidad
    if (nextRow.accion && !value.observacion_informe_calidad) {
      onChange("observacion_informe_calidad", nextRow.accion);
    }
    if (nextRow.entidad && !value.nombre_entidad) {
      onChange("nombre_entidad", nextRow.entidad);
    }
  }, [
    hasIndicadoresApi,
    indicadoresApi,
    usedIndicadoresSet,
    value.plan_id,
    value.indicador,
    value.observacion_informe_calidad,
    value.nombre_entidad,
    onChange,
  ]);

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
            className="w-full bg-gray-50 text-gray-700 cursor-not-allowed"
            value={value.nombre_entidad || ""}
            onChange={() => {}}
            required
            disabled
            readOnly
            aria-disabled
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
          {isDraft && (
            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              {estadoPlan}
            </span>
          )}
        </legend>
        {/* Indicador  */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Indicador
          </label>
          <div className="md:col-span-2">
            {hasIndicadoresApi ? (
              <>
                {(() => {
                  const currentIndicador = (value as any).indicador ?? "";
                  const trimmedCurrent = currentIndicador.trim();
                  const hasCurrentInOptions =
                    !!trimmedCurrent &&
                    indicadoresApi!.some(
                      (row) => (row.indicador ?? "").trim() === trimmedCurrent
                    );

                  return (
                    <select
                      className="w-full"
                      value={currentIndicador}
                      onChange={handleIndicadorSelect}
                      disabled={!canEditIndicador}
                      aria-disabled={!canEditIndicador}
                    >
                      <option value="">-- Selecciona un indicador --</option>

                      {/* Si hay un indicador guardado que NO está en la lista,
                          lo mostramos igual para admin/auditor */}
                      {trimmedCurrent && !hasCurrentInOptions && (
                        <option value={currentIndicador}>
                          {currentIndicador}
                        </option>
                      )}

                      {indicadoresApi!.map((row, idx) => {
                        const val = row.indicador ?? "";

                        const isUsedAny = !!val && usedIndicadoresSet.has(val);

                        const labelBase = row.indicador ?? "(sin indicador)";
                        const labelEntidad = row.entidad ? ` – ${row.entidad}` : "";
                        const suffix = isUsedAny ? " (Ya en plan)" : "";

                        return (
                          <option
                            key={idx}
                            value={val}
                            disabled={isUsedAny && !hasPlanPersisted}
                          >
                            {labelBase}
                            {labelEntidad}
                            {suffix}
                          </option>
                        );
                      })}
                    </select>
                  );
                })()}

                <p className="mt-1 text-xs text-gray-500">
                  {hasPlanPersisted
                    ? "El indicador de este plan ya está definido y no puede modificarse."
                    : "Los indicadores que ya tienen un plan asociado aparecen deshabilitados para nuevos planes."}
                </p>
              </>
            ) : (
              <input
                className="w-full"
                value={(value as any).indicador ?? ""}
                onChange={(e) => onChange("indicador" as any, e.target.value)}
                disabled={!canEditPlanBlock || !!ro["indicador"]}
                aria-disabled={!canEditPlanBlock || !!ro["indicador"]}
              />
            )}
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
              <option>Experencia en los canales de atención</option>
              <option>Satisfacción con el servicio recibido</option>
              <option>Calidad de las respuestas</option>
              <option>Digitalización y automatización de trámites</option>
              <option>Ahorros en los requisitos y tiempos</option>
              <option>Calidad de las respuestas</option>
              <option>Evaluación de capacidad instalada</option>
              <option>Evaluación de habilidades para atención diferencia</option>
              <option>Estándares y protocolos de atención</option>
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

        {/* Acción recomendada */}
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

        {/* Acción de mejora planteada (PLAN) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Acción de mejora planteada
          </label>

          <div className="md:col-span-2 space-y-2">
            <input
              className="w-full"
              placeholder="Escribe la(s) acción(es) de mejora, separadas por ',' ';' '.'"
              value={value.accion_mejora_planteada ?? ""}
              onChange={(e) => onChange("accion_mejora_planteada", e.target.value)}
              disabled={!canEditPlanBlock || !!ro["accion_mejora_planteada"]}
              aria-disabled={!canEditPlanBlock || !!ro["accion_mejora_planteada"]}
            />

            {hasMultipleActions && (
              <div className="mt-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <p className="font-semibold">Hemos detectado más de una posible acción.</p>
                <p>
                  Considera registrar cada acción como un plan separado antes de enviar.
                </p>
              </div>
            )}

            {canEditPlanBlock &&
              !!value.accion_mejora_planteada?.trim() &&
              onRequestNewPlanFromAction && (
                <button
                  type="button"
                  onClick={() =>
                    onRequestNewPlanFromAction(value.accion_mejora_planteada!.trim())
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800"
                >
                  <span className="text-base leading-none">＋</span>
                  <span>Crear otra acción de mejora</span>
                </button>
              )}
          </div>
        </div>

        {/* Descripción de las actividades (PLAN) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Descripción de las actividades
          </label>
          <div className="md:col-span-2">
            <textarea
              className="w-full min-h-28"
              value={value.plan_descripcion_actividades ?? ""}
              onChange={(e) =>
                onChange("plan_descripcion_actividades", e.target.value)
              }
              disabled={!canEditPlanBlock || !!ro["plan_descripcion_actividades"]}
              aria-disabled={!canEditPlanBlock || !!ro["plan_descripcion_actividades"]}
              maxLength={MAX_DESC_ACTIVIDADES}
            />
            <p className="mt-1 text-xs text-gray-500 text-right">
              {(value.plan_descripcion_actividades?.length ?? 0)}/{MAX_DESC_ACTIVIDADES} caracteres
            </p>
          </div>
        </div>

        {/* Descripción de la evidencia de cumplimiento de la acción (PLAN) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Descripción de la evidencia de cumplimiento de la acción
          </label>
          <div className="md:col-span-2">
            <textarea
              className="w-full min-h-28"
              value={value.plan_evidencia_cumplimiento ?? ""}
              onChange={(e) =>
                onChange("plan_evidencia_cumplimiento", e.target.value)
              }
              disabled={!canEditPlanBlock || !!ro["plan_evidencia_cumplimiento"]}
              aria-disabled={!canEditPlanBlock || !!ro["plan_evidencia_cumplimiento"]}
              maxLength={MAX_PLAN_EVIDENCIA}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>
                Describe brevemente las evidencias de cumplimiento previstas para esta acción.
              </span>
              <span>
                {(value.plan_evidencia_cumplimiento?.length ?? 0)}/{MAX_PLAN_EVIDENCIA} caracteres
              </span>
            </div>
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

        {/* Observación del equipo de la DDCS (PLAN) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
            Observación del equipo de la DDCS
          </label>
          <div className="md:col-span-2">
            <textarea
              className={`w-full min-h-24 ${
                !canEditObsCalidadPlan || !!ro["observacion_calidad"]
                  ? "bg-gray-50 opacity-60"
                  : ""
              }`}
              value={value.observacion_calidad ?? ""}
              onChange={(e) => onChange("observacion_calidad", e.target.value)}
              disabled={!canEditObsCalidadPlan || !!ro["observacion_calidad"]}
              aria-disabled={!canEditObsCalidadPlan || !!ro["observacion_calidad"]}
            />
            <p className="mt-1 text-xs text-gray-500">
              Esta observación la registra el equipo de la DDCS después de enviar el registro.
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
      {isSeguimientoVisible && (
        <fieldset
          id="seguimiento-section"
          className="mt-4 space-y-3 rounded-md border border-gray-300 p-3"
        >
          {/* Tabs de seguimientos */}
        <div className="mb-4">{header}</div>

          <legend className="px-2 text-sm font-semibold text-gray-700">
            Seguimiento a las acciones del Plan de mejoramiento
          </legend>

          {/* Fecha de reporte */}
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
                max={todayStr}
                onChange={(e) => {
                  const v = e.target.value;
                  const min = (value as any).created_at?.slice(0, 10) ?? todayStr;
                  if (v && (v < min || v > todayStr)) return;
                  onChange("fecha_reporte" as any, v);
                }}
                disabled={!canEditCamposEntidadSeguimiento || !!ro["fecha_reporte"]}
                aria-disabled={!canEditCamposEntidadSeguimiento || !!ro["fecha_reporte"]}
              />
            </div>
          </div>

          {/* Nombre Entidad (solo lectura) */}
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

          {/* Enlace entidad (solo lectura) */}
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

          {/* Acción de mejora planteada (como referencia, solo lectura) */}
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
                disabled={!canEditCamposEntidadSeguimiento || !!ro["descripcion_actividades"]}
                aria-disabled={!canEditCamposEntidadSeguimiento || !!ro["descripcion_actividades"]}
                maxLength={MAX_DESC_ACTIVIDADES}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {(value.descripcion_actividades?.length ?? 0)}/{MAX_DESC_ACTIVIDADES} caracteres
              </p>
            </div>
          </div>

          {/* Evidencias de cumplimiento de la acción (archivo) */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-start">
            <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
              <span className="flex items-center gap-2">
                Evidencias de cumplimiento de la acción
              </span>
            </label>
            <div className="md:col-span-2 space-y-2">
              {(() => {
                const raw = value.evidencia_cumplimiento ?? "";
                const isUrl =
                  typeof raw === "string" &&
                  (raw.startsWith("http://") || raw.startsWith("https://"));

                if (!isUrl) {
                  return (
                    <>
                      <div ref={eviHelpRef} className="relative flex items-center gap-2">
                        <input
                          type="file"
                          accept={[
                            // Imágenes
                            ".jpg",
                            ".jpeg",
                            ".png",
                            ".gif",
                            "image/*",
                            // Documentos
                            ".pdf",
                            "application/pdf",
                            // Excel / CSV
                            ".xls",
                            ".xlsx",
                            ".csv",
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "text/csv",
                            // Comprimidos
                            ".zip",
                            ".rar",
                            ".7z",
                            "application/zip",
                            "application/x-zip-compressed",
                            "application/x-rar-compressed",
                            "application/x-7z-compressed",
                          ].join(",")}
                          disabled={
                            !canEditCamposEntidadSeguimiento ||
                            !!ro["evidencia_cumplimiento"] ||
                            eviUploading
                          }
                          aria-disabled={
                            !canEditCamposEntidadSeguimiento ||
                            !!ro["evidencia_cumplimiento"] ||
                            eviUploading
                          }
                          aria-describedby="evidencia-help"
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
                        <button
                          type="button"
                          className="rounded-full border-0 bg-transparent p-1 text-gray-500 transition hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                          title={`Formatos: imágenes (JPG, PNG), PDF, Excel (XLS/XLSX/CSV) y comprimidos (ZIP, RAR, 7Z). Máximo ${MAX_UPLOAD_MB} MB. Para múltiples archivos, súbelos comprimidos.`}
                          aria-label={`Formatos permitidos y tamaño máximo de evidencia. Máximo ${MAX_UPLOAD_MB} MB.`}
                          onClick={() => setEviHelpOpen((v) => !v)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setEviHelpOpen((v) => !v);
                            }
                          }}
                        >
                          <FiInfo className="h-4 w-4" />
                        </button>
                        {eviHelpOpen && (
                          <div className="absolute right-0 top-full z-10 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg">
                            <p className="mt-1">
                             <b>Formatos:</b> imágenes (JPG, PNG), PDF, Excel (XLS/XLSX/CSV) y comprimidos (ZIP, RAR, 7Z).
                            </p>
                            <p className="mt-1">
                              <b>Tamaño máximo: {MAX_UPLOAD_MB} MB.</b> Si tienes múltiples archivos, súbelos en un comprimido.
                            </p>
                          </div>
                        )}
                      </div>
                      <span id="evidencia-help" className="sr-only">
                        Formatos permitidos: imágenes JPG, PNG; PDF; Excel XLS, XLSX, CSV; y comprimidos ZIP, RAR, 7Z. Tamaño máximo {MAX_UPLOAD_MB} megabytes. Para múltiples evidencias, súbelas en un archivo comprimido.
                      </span>
                      {eviUploading && (
                        <p className="text-xs text-gray-500">Subiendo evidencia…</p>
                      )}
                      {eviError && (
                        <p className="text-xs text-red-600">{eviError}</p>
                      )}
                    </>
                  );
                }

                return (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <a
                      href={raw}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-medium underline"
                    >
                      Ver evidencia
                    </a>
                    {(isAdmin || isEntidad) &&
                      canEditCamposEntidadSeguimiento &&
                      !ro["evidencia_cumplimiento"] && (
                        <button
                          type="button"
                          onClick={() => onChange("evidencia_cumplimiento", "")}
                          className="rounded-xl bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          Quitar
                        </button>
                      )}
                  </div>
                );
              })()}
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
                disabled={!canEditSeguimientoEstado || !!ro["seguimiento"]}
                aria-disabled={!canEditSeguimientoEstado || !!ro["seguimiento"]}
              >
                <option>Pendiente</option>
                <option>En progreso</option>
                <option>Finalizado</option>
              </select>
            </div>
          </div>

          {/* Observación del equipo de la DDCS (editable por auditor/admin) */}
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
                maxLength={MAX_OBS_DDCS_SEG}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                {(value.observacion_calidad?.length ?? 0)}/{MAX_OBS_DDCS_SEG} caracteres
              </p>
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
