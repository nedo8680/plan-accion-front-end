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
import ImportSeguimientoFile from "../components/seguimiento/ImportSeguimientoFile";

import {
  exportSeguimientosCSV,
  exportSeguimientosXLSX,
  exportSeguimientosPDF,
} from "../components/seguimiento/exporters";

// ─────────────────────────────────────────────────────────────
// Botonera de exportación (plan seleccionado)
// ─────────────────────────────────────────────────────────────
function ExportPlanButtons({
  plan,
  segs,
}: {
  plan: Plan | null;
  segs: Seguimiento[];
}) {
  const disabled = !plan || segs.length === 0;

  return (
    <div className="ml-2 flex items-center gap-2">
      <span className="text-xs font-medium text-gray-600">Exportar:</span>
      <button
        type="button"
        onClick={() => exportSeguimientosCSV(plan, segs)}
        className="btn-outline"
        disabled={disabled}
        title={disabled ? "Selecciona un plan con seguimientos" : "Exportar CSV"}
      >
        CSV
      </button>
      <button
        type="button"
        onClick={() => exportSeguimientosXLSX(plan, segs)}
        className="btn-outline"
        disabled={disabled}
        title={disabled ? "Selecciona un plan con seguimientos" : "Exportar XLSX"}
      >
        XLSX
      </button>
      <button
        type="button"
        onClick={() => exportSeguimientosPDF(plan, segs)}
        className="btn-outline"
        disabled={disabled}
        title={disabled ? "Selecciona un plan con seguimientos" : "Exportar PDF"}
      >
        PDF
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
  } = useSeguimientos();

  const { user } = useAuth();
  const role = user?.role;
  const isEntidad = role === "entidad";
  const isAuditor = role === "auditor";
  const isAdmin   = role === "admin";

  const activeChild = children[pagerIndex];
  const activeChildId = activePlanId ? activeChild?.id : undefined;

  // permisos
  const canDeleteChild = !!activeChildId && (isAdmin || isEntidad);
  const canDeletePlan  = !!activePlanId && (isAdmin || isEntidad);
  const canAddChild    = Boolean(activePlanId || (current as any)?.nombre_entidad?.trim());

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
      await saveCurrent({ seguimiento: "En progreso" });
      alert("Seguimiento enviado a revisión.");
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
      const el = formFocusRef.current;
      if (el) {
        el.focus();
        el.closest("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
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
            <button className="btn-outline" onClick={startNew}>Nuevo registro</button>

            {/* Borrar plan */}
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${
                canDeletePlan ? "bg-rose-700 hover:bg-rose-800" : "bg-rose-300 cursor-not-allowed"
              }`}
              type="button"
              disabled={!canDeletePlan}
              onClick={() => {
                if (!activePlanId) return;
                if (confirm("¿Eliminar este plan y todos sus seguimientos?")) removePlan(activePlanId);
              }}
            >
              Borrar registro
            </button>

            {/* Exportar (plan + seguimientos) */}
            <ExportPlanButtons plan={activePlan} segs={children} />
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
                <h2 className="text-lg font-semibold">Formulario · Seguimiento</h2>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={resetCurrent}
                  title="Limpiar formulario actual"
                >
                  <FaEraser /> <span className="hidden sm:inline">Limpiar</span>
                </button>
              </div>
              <ImportSeguimientoFile onImport={importSeguimientoFields} />
              <SeguimientoForm
                value={current as any}
                onChange={updateLocal as any}
                readOnlyFields={{ observacion_calidad: isEntidad }}
                focusRef={formFocusRef}
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
                      try { await addChildImmediate(); }
                      catch (e: any) { alert(e?.message ?? "No se pudo crear el seguimiento."); }
                    }}
                    onDelete={() => {
                      if (activeChildId && confirm("¿Eliminar este seguimiento?")) {
                        removeById(activeChildId);
                      }
                    }}
                    canAdd={canAddChild}
                    canDelete={canDeleteChild}
                    hideActions  
                  />
                }
                planActions={
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await addChildImmediate();
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
                        if (activeChildId && confirm("¿Eliminar este seguimiento?")) {
                          removeById(activeChildId);
                        }
                      }}
                      disabled={!canDeleteChild || !activeChildId}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${
                        canDeleteChild && activeChildId
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-amber-300 cursor-not-allowed"
                      }`}
                    >
                      Borrar seguimiento
                    </button>
                  </div>
                }
                footer={
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleEnviar}
                      disabled={!isDuplicableCurrent || sending}
                      className="inline-flex items-center gap-2 rounded-md bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60 w-full sm:w-auto"
                      title="Guardar y enviar"
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
