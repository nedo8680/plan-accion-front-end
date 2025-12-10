import React from "react";
import Header from "../components/Header";
import PageBg from "../components/PageBackground";
import { FaEraser } from "react-icons/fa";
import SeguimientoForm from "../components/seguimiento/SeguimientoForm";
import { useSeguimientos, type Plan, type Seguimiento } from "../components/seguimiento/useSeguimientos";
import { useAuth } from "../context/AuthContext";
import { FiSend } from "react-icons/fi";

import SeguimientoTabs from "../components/seguimiento/SeguimientoTabs";
import PlanesSidebar from "../components/seguimiento/PlanesSidebar";
import SeguimientosTimeline from "../components/seguimiento/SeguimientosTimeline";
import IndicadoresAutoLoader from "../components/seguimiento/IndicadoresAutoLoader";

import {
  exportAllSeguimientosCSV,
  exportAllSeguimientosXLSX,
  exportAllSeguimientosPDF,
} from "../components/seguimiento/exporters";

// ─────────────────────────────────────────────────────────────
// Botonera de exportación (todos los planes/seguimientos)
// ─────────────────────────────────────────────────────────────
function ExportPlanButtons({
  hasData,
  loadAllSeguimientos,
}: {
  hasData: boolean;
  loadAllSeguimientos: () => Promise<{ plan: Plan; seguimientos: Seguimiento[] }[]>;
}) {
  const [loading, setLoading] = React.useState(false);

  async function handle(kind: "csv" | "xlsx" | "pdf") {
    try {
      setLoading(true);
      const groups = await loadAllSeguimientos();
      if (!groups.length) {
        alert("No hay registros para exportar.");
        return;
      }
      if (kind === "csv") {
        exportAllSeguimientosCSV(groups);
      } else if (kind === "xlsx") {
        await exportAllSeguimientosXLSX(groups);
      } else {
        await exportAllSeguimientosPDF(groups);
      }
    } catch (e: any) {
      console.error("Exportación fallida", e);
      alert(e?.message ?? "No se pudo exportar los seguimientos.");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !hasData;

  return (
    <div className="ml-2 flex items-center gap-2">
      <span className="text-xs font-medium text-gray-600">Exportar todos:</span>
      <button
        type="button"
        onClick={() => handle("csv")}
        className="btn-outline"
        disabled={disabled}
        title={disabled ? "No hay registros para exportar" : "Exportar todos los seguimientos en CSV"}
      >
        {loading ? "Exportando..." : "CSV"}
      </button>
      <button
        type="button"
        onClick={() => handle("xlsx")}
        className="btn-outline"
        disabled={disabled}
        title={disabled ? "No hay registros para exportar" : "Exportar todos los seguimientos en XLSX"}
      >
        {loading ? "Exportando..." : "XLSX"}
      </button>
      <button
        type="button"
        onClick={() => handle("pdf")}
        className="btn-outline"
        disabled={disabled}
        title={disabled ? "No hay registros para exportar" : "Exportar todos los seguimientos en PDF"}
      >
        {loading ? "Exportando..." : "PDF"}
      </button>
    </div>
  );
}

export default function SeguimientoPage() {
  const {
    plans,                    // planes padre
    activePlanId, setActive,  // id plan activo
    children,                 // seguimientos del plan activo
    current, updateLocal, resetCurrent, startNew, saveCurrent,
    removeById, addChildImmediate, removePlan,
    isDuplicableCurrent, pagerIndex, setActiveChild,
    createdOrder,
    toggleCreatedOrder,
    importSeguimientoFields,  
    createPlanFromAction, 
    usedIndicadores,
    loadSeguimientosForExport,
    planMissingKeys,
  } = useSeguimientos();
  
  type IndicadorApiRow = {
    entidad: string | undefined;
    indicador: string | undefined;
    accion: string | undefined;
  };

  const [indicadoresApi, setIndicadoresApi] = React.useState<IndicadorApiRow[]>([]);

  const { user } = useAuth();
  const role = user?.role;
  const isEntidad = role === "entidad";
  const isAuditor = role === "auditor";
  const isAdmin   = role === "admin";

  const currentAny = current as any;
  const isSeguimientoActual = Boolean(currentAny?.plan_id);
  const estadoSeguimientoActual = (currentAny?.seguimiento as string) || "Pendiente";
  const currentSeguimientoId = isSeguimientoActual ? currentAny?.id : undefined;
  const estadoPlanActual: string | null =
    (currentAny?.estado as string) ?? null; 
  
  
  const hasSeguimientoActual =
  Boolean(currentAny?.id) || Boolean(currentAny?.fecha_reporte);


  const isDraftPlan =
  estadoPlanActual === "Borrador" && !hasSeguimientoActual;
  
  const isPlanAprobado =
  (currentAny?.aprobado_evaluador as string) === "Aprobado"; 

  // Bloque de seguimiento visible solo si hay plan y NO está en borrador
  const isSeguimientoVisible =
  Boolean(currentAny?.plan_id) &&
  !isDraftPlan &&
  isPlanAprobado;


  // Regla: la entidad NO puede reenviar/modificar seguimientos que ya no están en "Pendiente"
  const entidadNoPuedeEnviar =
    isEntidad && isSeguimientoActual && estadoSeguimientoActual !== "Pendiente";

  const activeChild = children[pagerIndex] ?? null;
  const activeChildId = activeChild?.id;

  // permisos
  const canDeleteChild = !!currentSeguimientoId && isAdmin;
  const canDeletePlan = isAdmin && !!activePlanId;

  const canResetForm = isAdmin || isEntidad;
  const canAddChild =
    (isAdmin || isEntidad) &&
    Boolean(activePlanId || (current as any)?.nombre_entidad?.trim());

  // plan activo (objeto)
  const activePlan = React.useMemo(
    () => plans.find(p => p.id === activePlanId) ?? null,
    [plans, activePlanId]
  );

  // enviar/guardar
  const [sending, setSending] = React.useState(false);
  async function handleEnviar() {
    try {
      setSending(true);

      //const currentAny = current as any;
      //const isDraftPlan = currentAny?.estado === "Borrador";

      if (isEntidad || isAdmin) {
        const overrides: any = {};

        if (isDraftPlan) {
          overrides.estado = "Pendiente";
         message =
            "Acción de mejora enviada con éxito, el reporte de seguimiento lo podrá realizar una vez sea aprobado por la DDCS";
        } else {
          message = "Seguimiento enviado con éxito";
        }

        const saved = await saveCurrent(overrides);
        if (!saved) return;
        alert("message");
      } else {
        // admin / auditor simplemente guardan cambios
        const saved = await saveCurrent({} as any);
        if (!saved) return;
        alert("Seguimiento guardado.");
      }
    } finally {
      setSending(false);
    }
  }

  // ===== Solo móvil: alternar Formulario/Historial
  const [mobileTab, setMobileTab] = React.useState<"form" | "history">(
    () => (children.length ? "history" : "form")
  );

  // Enfocar formulario (desktop)
  const formFocusRef = React.useRef<HTMLInputElement>(null);
  function focusForm() {
    setMobileTab("form");
    requestAnimationFrame(() => {
      const section = document.getElementById("seguimiento-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
        const firstInput = section.querySelector<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >("input, textarea, select");
        firstInput?.focus();
      }
    });
  }
  // Crear uno o varios planes usando la(s) acción(es) de mejora actual(es)
  const handleNewPlanFromAction = async (accionRaw: string) => {
    const raw = (accionRaw || "").trim();
    if (!raw) return;

    // Usamos el mismo criterio que en SeguimientoForm: \n ; , .
    const partes = raw
      .split(/[\n;,.]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (!partes.length) return;

    const originalPlanId = activePlanId;
    const curr = current as any;
    const indicadorBase = curr?.indicador ?? "";

    try {
      if (originalPlanId && partes.length >= 2) {
        updateLocal("accion_mejora_planteada" as any, partes[0]);
      }
      
      const accionesParaNuevosPlanes = originalPlanId ? partes.slice(1) : partes;

      for (const acc of accionesParaNuevosPlanes) {
        await createPlanFromAction(acc, indicadorBase);
      }

      if (originalPlanId) {
        await setActive(originalPlanId);
      }

      requestAnimationFrame(() => {
        const main = document.querySelector("main");
        main?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (e: any) {
      alert(e?.message ?? "No se pudieron crear los nuevos registros a partir de las acciones.");
    }
  };


  React.useEffect(() => {
    setMobileTab(children.length ? "history" : "form");
  }, [activePlanId, children.length]);

  return (
    <PageBg>
      <Header />
      <main className="mx-auto max-w-6xl p-4">
        {/* Toolbar superior */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Seguimiento</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800  ${
                !isAuditor ? "bg-white hover:bg-gray-100" : "bg-gray-400 text-white cursor-not-allowed"
              }`}
              onClick={() => startNew()}
              disabled={isAuditor}
            >
              Nuevo registro
            </button>
            {/* Borrar plan */}
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${
                canDeletePlan ? "bg-rose-700 hover:bg-rose-800" : "bg-rose-300 cursor-not-allowed"
              }`}
              type="button"
              disabled={!canDeletePlan}
              onClick={() => {
                if (!activePlanId || !isAdmin) return;
                if (confirm("¿Eliminar esta acción de mejora y sus seguimientos?")) removePlan(activePlanId);
              }}
            >
              Borrar registro
            </button>

            {/* Exportar todos los planes + seguimientos */}
            <ExportPlanButtons
              hasData={plans.length > 0}
              loadAllSeguimientos={loadSeguimientosForExport}
            />
          </div>
        </div>

        {/* Layout maestro-detalle */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Sidebar de planes */}
          <div className="lg:col-span-4">
            <PlanesSidebar
              plans={plans}
              activePlanId={activePlanId}
              onSelect={(id) => setActive(id)}
              count={plans.length}
              createdOrder={createdOrder}
              toggleCreatedOrder={toggleCreatedOrder}
              activeEstado={estadoPlanActual}
              activeChildrenCount={children.length}
            />
          </div>

          {/* Panel principal */}
          <div className="lg:col-span-8 space-y-4">
            {/* Segment control SOLO móvil */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileTab("form")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mobileTab === "form" ? "bg-white shadow text-gray-900" : "text-gray-600"
                }`}
              >
                Formulario
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("history")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  mobileTab === "history" ? "bg-white shadow text-gray-900" : "text-gray-600"
                }`}
              >
                Historial ({children.length})
              </button>
            </div>

            {/* Formulario */}
            <section className={`card ${mobileTab === "form" ? "block" : "hidden lg:block"}`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Acción de Mejora</h2>
                {canResetForm && (
                  <button
                  type="button"
                  className="btn-outline"
                  onClick={resetCurrent}
                  title="Limpiar formulario actual"
                  >
                    <FaEraser /> <span className="hidden sm:inline">Limpiar</span>
                  </button>
                )}
               

              </div>
              <IndicadoresAutoLoader
                onImport={importSeguimientoFields}
                onOptionsFromApi={setIndicadoresApi}
                nombreEntidad={(current as any)?.nombre_entidad || user?.entidad}
              />

              <SeguimientoForm
                value={current as any}
                onChange={updateLocal as any}
                readOnlyFields={{ observacion_calidad: isEntidad }}
                focusRef={formFocusRef}
                indicadoresApi={indicadoresApi}   
                onRequestNewPlanFromAction={handleNewPlanFromAction}
                usedIndicadores={usedIndicadores}  
                missingPlanKeys={planMissingKeys}
                header={
                  <SeguimientoTabs
                    items={children}
                    activeId={activeChildId}
                    onSelect={(id) => {
                      const idx = children.findIndex((c) => c.id === id);
                      if (idx >= 0) setActiveChild(idx);
                      focusForm();
                    }}
                    onAdd={async () => {
                    try {
                      await addChildImmediate();
                      focusForm();
                    } catch (e: any) {
                      alert(e?.message ?? "No se pudo crear el seguimiento.");
                    }
                  }}

                    onDelete={() => {
                      if (currentSeguimientoId && confirm("¿Eliminar este seguimiento?")) {
                        removeById(currentSeguimientoId);
                      }
                    }}

                    canAdd={canAddChild}
                    canDelete={canDeleteChild}
                  />
                }
                planActions={
                  !isAuditor && isSeguimientoVisible ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await addChildImmediate();
                            focusForm();
                          } catch (e: any) {
                            alert(e?.message ?? "No se pudo crear el seguimiento.");
                          }
                        }}
                        disabled={!canAddChild}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${
                          canAddChild
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-emerald-300 cursor-not-allowed"
                        }`}
                      >
                        Agregar seguimiento
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAdmin) return;
                          if (currentSeguimientoId && confirm("¿Eliminar este seguimiento?")) {
                            removeById(currentSeguimientoId);
                          }
                        }}
                        disabled={!canDeleteChild || !currentSeguimientoId}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${
                          canDeleteChild && currentSeguimientoId
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-amber-300 cursor-not-allowed"
                        }`}
                      >
                        Borrar seguimiento
                      </button>
                    </div>
                  ) : null
                }

                footer={
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleEnviar}
                      disabled={!isDuplicableCurrent || sending || entidadNoPuedeEnviar}
                      className="inline-flex items-center gap-2 rounded-md bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60 w-full sm:w-auto"
                      title={
                        entidadNoPuedeEnviar
                          ? "La entidad no puede modificar un seguimiento ya enviado. Cree un nuevo seguimiento."
                          : "Guardar y enviar"
                      }
                    >
                      <FiSend /> {sending ? "Enviando..." : "Enviar"}
                    </button>
                  </div>
                }
              />

              {isAuditor && (
                <p className="mt-2 text-xs text-gray-500">
                  Como auditor puedes editar la observación de calidad y guardar.
                </p>
              )}
              {isEntidad && (
                <p className="mt-2 text-xs text-gray-500">
                  Como entidad no puedes editar “Observación del informe de calidad”.
                </p>
              )}
            </section>

            {/* Historial (debajo en desktop; tab en móvil) */}
            <section className={`${mobileTab === "history" ? "block" : "hidden lg:block"}`}>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                Historial de seguimientos
              </h3>
              <SeguimientosTimeline
                items={children}
                activeId={activeChildId}
                onSelect={(id) => {
                  const idx = children.findIndex((c) => c.id === id);
                  if (idx >= 0) setActiveChild(idx);
                  focusForm();
                }}
              />
            </section>
          </div>
        </div>
      </main>
    </PageBg>
  );
}
