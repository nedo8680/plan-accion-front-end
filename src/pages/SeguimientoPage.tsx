import React from "react";
import Header from "../components/Header";
import PageBg from "../components/PageBackground";
import { FaEraser } from "react-icons/fa";
import SeguimientoForm from "../components/seguimiento/SeguimientoForm";
import { useSeguimientos } from "../components/seguimiento/useSeguimientos";
import { useAuth } from "../context/AuthContext";

import SeguimientoTabs from "../components/seguimiento/SeguimientoTabs";
import PlanesSidebar from "../components/seguimiento/PlanesSidebar";
import SeguimientosTimeline from "../components/seguimiento/SeguimientosTimeline";

export default function SeguimientoPage() {
  const {
    plans, rows, activePlanId, setActive,
    children, current, updateLocal, resetCurrent, startNew, saveCurrent,
    removeById, addChildImmediate, removePlan,
    isDuplicableCurrent, pagerIndex, setActiveChild,
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

  // exportadores
  function ensureOrAlert(): boolean {
    if (rows.length === 0) { alert("No hay registros guardados para exportar."); return false; }
    return true;
  }
  function exportCSV() {
    if (!ensureOrAlert()) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => {
          const v = (r as any)[h] ?? "";
          const s = String(v).replace(/\r?\n|\r/g, " ").trim();
          return /[\",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url; a.download = `seguimientos_${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  }
  async function exportXLSX() {
    if (!ensureOrAlert()) return;
    const xlsx = await import("xlsx");
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Planes");
    const today = new Date().toISOString().slice(0, 10);
    xlsx.writeFile(wb, `planes_${today}.xlsx`);
  }
  async function exportPDF() {
    if (!ensureOrAlert()) return;
    const [{ default: jsPDF }, auto] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const doc = new jsPDF({ orientation: "landscape" });
    const headers = Object.keys(rows[0]);
    const body = rows.map((r) => headers.map((h) => (r as any)[h] ?? ""));
    (auto as any).default(doc, { head: [headers], body, styles: { fontSize: 8 }, headStyles: { fillColor: [10,47,90] } });
    const today = new Date().toISOString().slice(0, 10);
    doc.save(`planes_${today}.pdf`);
  }
  async function guardarEnviar() { await saveCurrent(); alert("Guardado correctamente."); }

  // ===== Solo móvil: segment control para alternar Formulario/Historial
  const [mobileTab, setMobileTab] = React.useState<"form" | "history">(
    () => (children.length ? "history" : "form")
  );
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

            {/* Borrar registro (plan) */}
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

            <button className="btn" onClick={guardarEnviar} disabled={!isDuplicableCurrent}>
              Guardar / Enviar
            </button>

            <div className="ml-2 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Exportar:</span>
              <button type="button" onClick={exportCSV} className="btn-outline">CSV</button>
              <button type="button" onClick={exportXLSX} className="btn-outline">XLSX</button>
              <button type="button" onClick={exportPDF} className="btn-outline">PDF</button>
            </div>
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
            />
          </div>

          {/* Panel principal */}
          <div className="lg:col-span-8 space-y-4">
            {/* Segment control SOLO en móvil */}
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
            <section
              className={`card ${mobileTab === "form" ? "block" : "hidden lg:block"}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Formulario · Seguimiento</h2>
                <button type="button" className="btn-outline" onClick={resetCurrent} title="Limpiar formulario actual">
                  <FaEraser /> <span className="hidden sm:inline">Limpiar</span>
                </button>
              </div>

              <SeguimientoForm
                value={current as any}
                onChange={updateLocal as any}
                readOnlyFields={{ observacion_calidad: isEntidad }}
                header={
                  <SeguimientoTabs
                    items={children}
                    activeId={activeChildId}
                    onSelect={(id) => {
                      const idx = children.findIndex((c) => c.id === id);
                      if (idx >= 0) setActiveChild(idx);
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
                  />
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

            {/* Historial debajo del formulario en escritorio; en móvil alterna por tab */}
            <section className={`${mobileTab === "history" ? "block" : "hidden lg:block"}`}>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">Historial de seguimientos</h3>
              <SeguimientosTimeline
                items={children}
                activeId={activeChildId}
                onSelect={(id) => {
                  const idx = children.findIndex((c) => c.id === id);
                  if (idx >= 0) setActiveChild(idx);
                }}
              />
            </section>
          </div>
        </div>
      </main>
    </PageBg>
  );
}
