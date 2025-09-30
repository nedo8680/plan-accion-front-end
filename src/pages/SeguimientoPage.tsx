import React from "react";
import Header from "../components/Header";
import PageBg from "../components/PageBackground";
import { FaEraser, FaTrash, FaCopy, FaPlus } from "react-icons/fa";
import SeguimientoForm from "../components/seguimiento/SeguimientoForm";
import { useSeguimientos } from "../components/seguimiento/useSeguimientos";

export default function SeguimientoPage() {
  const {
    items,
    active,
    setActive,
    current,
    update,
    resetCurrent,
    duplicate,
    remove,
    rows,
    isDuplicableCurrent,
  } = useSeguimientos();

  function ensureOrAlert(): boolean {
    if (rows.length === 0) {
      alert("No hay registros válidos para exportar. Cada registro requiere: Nombre Entidad y Fecha Inicio.");
      return false;
    }
    return true;
  }

  function exportCSV() {
    if (!ensureOrAlert()) return;
    const headers = Object.keys(rows[0]);
    const sanitize = (v: any) =>
      v == null ? "" : typeof v === "string" ? v.replace(/\r?\n|\r/g, " ").trim() : String(v);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = sanitize((r as any)[h]);
            return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `seguimientos_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportXLSX() {
    if (!ensureOrAlert()) return;
    const xlsx = await import("xlsx");
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Seguimientos");
    const today = new Date().toISOString().slice(0, 10);
    xlsx.writeFile(wb, `seguimientos_${today}.xlsx`);
  }

  async function exportPDF() {
    if (!ensureOrAlert()) return;
    const [{ default: jsPDF }, auto] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const doc = new jsPDF({ orientation: "landscape" });
    const headers = Object.keys(rows[0]);
    const body = rows.map((r) => headers.map((h) => (r as any)[h] ?? ""));
    (auto as any).default(doc, {
      head: [headers],
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [10, 47, 90] },
    });
    const today = new Date().toISOString().slice(0, 10);
    doc.save(`seguimientos_${today}.pdf`);
  }

  const exportDisabled = rows.length === 0;

  return (
    <PageBg>
      <Header />
      <main className="mx-auto max-w-6xl p-4">
        <h1 className="mb-4 text-2xl font-semibold">Seguimiento</h1>

        {/* Card del formulario y barra de exportación */}
        <section className="card mb-6">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Formulario · Seguimiento </h2>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                className="btn-outline"
                onClick={resetCurrent}
                title="Limpiar formulario actual"
                aria-label="Limpiar formulario"
              >
                <FaEraser /> <span className="hidden sm:inline">Limpiar</span>
              </button>

              <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

              {/* Exportar  */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Exportar:</span>
                <button
                  type="button"
                  onClick={exportCSV}
                  className={`btn-outline ${exportDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                  title="Exportar a CSV"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={exportXLSX}
                  className={`btn-outline ${exportDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                  title="Exportar a Excel"
                >
                  XLSX
                </button>
                <button
                  type="button"
                  onClick={exportPDF}
                  className={`btn-outline ${exportDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                  title="Exportar a PDF"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>

          <SeguimientoForm 
            value={current}
            onChange={update}
            index={active}
            total={items.length}
            onAdd={() => {
              if (!isDuplicableCurrent) {
                alert("Para agregar un plan, ingresa al menos el Nombre de la Entidad.");
                return;
              }
              duplicate(); // tu duplicate redefine “agregar plan”
            }}
            onRemove={remove}
            canAdd={isDuplicableCurrent}
            setActive={setActive} />

          <p className="mt-3 text-xs text-gray-600">
            Para exportar, cada registro debe tener <b>Nombre Entidad</b> y <b>Fecha Inicio</b>. Para{" "}
            <b>duplicar</b>, se requiere al menos <b>Nombre Entidad</b>.
          </p>
        </section>
      </main>
    </PageBg>
  );
}
