import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import { FaEraser } from "react-icons/fa";

/** 
 * Requiere mínimo: N° Plan de Mejora, Nombre Entidad y Fecha de inicio.
 */

type FormState = {
  num_plan_mejora: string;
  nombre_entidad: string;
  observacion_informe_calidad: string;
  insumo_mejora: string;
  tipo_accion_mejora: string;
  accion_mejora_planteada: string;
  descripcion_actividades: string;
  evidencia_cumplimiento: string;
  fecha_inicio: string;
  fecha_final: string;
  seguimiento: string;
  enlace_entidad: string;
};

export default function SeguimientoPage() {
  const [form, setForm] = useState<FormState>({
    num_plan_mejora: "",
    nombre_entidad: "",
    observacion_informe_calidad: "",
    insumo_mejora: "",
    tipo_accion_mejora: "",
    accion_mejora_planteada: "",
    descripcion_actividades: "",
    evidencia_cumplimiento: "",
    fecha_inicio: "",
    fecha_final: "",
    seguimiento: "Pendiente",
    enlace_entidad: "",
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm({
      num_plan_mejora: "",
      nombre_entidad: "",
      observacion_informe_calidad: "",
      insumo_mejora: "",
      tipo_accion_mejora: "",
      accion_mejora_planteada: "",
      descripcion_actividades: "",
      evidencia_cumplimiento: "",
      fecha_inicio: "",
      fecha_final: "",
      seguimiento: "Pendiente",
      enlace_entidad: "",
    });
  }

  // Filas exportables (1 registro)
  const rows = useMemo(() => {
    const r = {
      "N° Plan": form.num_plan_mejora,
      "Entidad": form.nombre_entidad,
      "Obs. Informe de Calidad": form.observacion_informe_calidad,
      "Insumo de mejora": form.insumo_mejora,
      "Tipo de acción": form.tipo_accion_mejora,
      "Acción planteada": form.accion_mejora_planteada,
      "Descripción actividades": form.descripcion_actividades,
      "Evidencia (URL)": form.evidencia_cumplimiento,
      "Fecha Inicio": form.fecha_inicio,
      "Fecha Final": form.fecha_final,
      "Seguimiento": form.seguimiento,
      "Enlace entidad": form.enlace_entidad,
    };
    return [r];
  }, [form]);

  // Validación mínima para exportar
  function canExport() {
    return (
      form.num_plan_mejora.trim() !== "" &&
      form.nombre_entidad.trim() !== "" &&
      form.fecha_inicio.trim() !== ""
    );
  }

  function ensureOrAlert(): boolean {
    if (!canExport()) {
      alert("Debe diligenciar al menos: N° Plan de Mejora, Nombre Entidad y Fecha de inicio antes de exportar.");
      return false;
    }
    return true;
  }

  // Exportadores locales
  function exportCSV() {
    if (!ensureOrAlert()) return;
    const headers = Object.keys(rows[0]);
    const sanitize = (v: any) => {
      if (v == null) return "";
      if (typeof v === "string") return v.replace(/\r?\n|\r/g, " ").trim();
      return String(v);
    };
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => {
        const val = sanitize((r as any)[h]);
        return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(","))
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0,10);
    a.href = url; a.download = `seguimiento_form_${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function exportXLSX() {
    if (!ensureOrAlert()) return;
    const xlsx = await import("xlsx");
    const ws = xlsx.utils.json_to_sheet(rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Datos");
    const today = new Date().toISOString().slice(0,10);
    xlsx.writeFile(wb, `seguimiento_form_${today}.xlsx`);
  }

  async function exportPDF() {
    if (!ensureOrAlert()) return;
    const [{ default: jsPDF }, auto] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable")
    ]);
    const doc = new jsPDF({ orientation: "landscape" });
    const headers = Object.keys(rows[0]);
    const body = rows.map(r => headers.map(h => (r as any)[h] ?? ""));

    (auto as any).default(doc, {
      head: [headers],
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [10, 47, 90] }
    });

    const today = new Date().toISOString().slice(0,10);
    doc.save(`seguimiento_form_${today}.pdf`);
  }

  const disabled = !canExport();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl p-4">
        <h1 className="mb-4 text-2xl font-semibold">Seguimiento</h1>

        {/* Card de Formulario con acciones en el header (derecha) */}
        <section className="card mb-6">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Formulario</h2>

            {/* Acciones arriba a la derecha */}
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                type="button"
                className="btn-outline"
                onClick={reset}
                title="Limpiar formulario (restablece todos los campos)"
                aria-label="Limpiar formulario"
              >
                <FaEraser /> <span className="hidden sm:inline">Limpiar</span>
              </button>

              <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Exportar</span>
                <button
                  type="button"
                  onClick={exportCSV}
                  className={`btn-outline ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  title="Exportar a CSV"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={exportXLSX}
                  className={`btn-outline ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  title="Exportar a Excel"
                >
                  XLSX
                </button>
                <button
                  type="button"
                  onClick={exportPDF}
                  className={`btn-outline ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                  title="Exportar a PDF"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* ===== NUEVO LAYOUT DE FORMULARIO ===== */}
          <form className="space-y-3">
            {/* Fila: N° Plan, Nombre Entidad */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
              <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
                N° Plan de Mejora <span className="text-red-600">*</span>
              </label>
              <div className="md:col-span-2">
                <input
                  className="w-full"
                  value={form.num_plan_mejora}
                  onChange={e=>update("num_plan_mejora", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
              <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Nombre Entidad <span className="text-red-600">*</span>
              </label>
              <div className="md:col-span-2">
                <input
                  className="w-full"
                  value={form.nombre_entidad}
                  onChange={e=>update("nombre_entidad", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Fila: Observación (ocupa ancho completo del contenido) */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Observación del informe de calidad
              </label>
              <div className="md:col-span-2">
                <textarea
                  className="w-full min-h-28"
                  value={form.observacion_informe_calidad}
                  onChange={e=>update("observacion_informe_calidad", e.target.value)}
                />
              </div>
            </div>

            {/* Insumo / Tipo de acción */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
              <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Insumo de mejora
              </label>
              <div className="md:col-span-2">
                <input
                    className="w-full"
                    value={form.insumo_mejora}
                    onChange={e=>update("insumo_mejora", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
              <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Tipo de acción de mejora
              </label>
              <div className="md:col-span-2">
                <input
                  className="w-full"
                  value={form.tipo_accion_mejora}
                  onChange={e=>update("tipo_accion_mejora", e.target.value)}
                />
              </div>
            </div>

            {/* Acción planteada (larga) */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Acción de mejora planteada
              </label>
              <div className="md:col-span-2">
                <input
                  className="w-full"
                  value={form.accion_mejora_planteada}
                  onChange={e=>update("accion_mejora_planteada", e.target.value)}
                />
              </div>
            </div>

            {/* Descripción actividades (larga) */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="self-center text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Descripción de las actividades
              </label>
              <div className="md:col-span-2">
                <textarea
                  className="w-full min-h-28"
                  value={form.descripcion_actividades}
                  onChange={e=>update("descripcion_actividades", e.target.value)}
                />
              </div>
            </div>

            {/* Evidencia URL */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
              <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Evidencia de cumplimiento (URL)
              </label>
              <div className="md:col-span-2">
                <input
                  className="w-full"
                  value={form.evidencia_cumplimiento}
                  onChange={e=>update("evidencia_cumplimiento", e.target.value)}
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
              <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Fecha Inicio <span className="text-red-600">*</span>
              </label>
              <div className="md:col-span-2">
                <input
                  type="date"
                  className="w-full"
                  required
                  value={form.fecha_inicio}
                  onChange={e=>update("fecha_inicio", e.target.value)}
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
                  value={form.fecha_final}
                  onChange={e=>update("fecha_final", e.target.value)}
                />
              </div>
            </div>

            {/* Seguimiento */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
              <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Seguimiento
              </label>
              <div className="md:col-span-2">
                <select
                  className="w-full"
                  value={form.seguimiento}
                  onChange={e=>update("seguimiento", e.target.value)}
                >
                  <option>Pendiente</option>
                  <option>En progreso</option>
                  <option>Finalizado</option>
                </select>
              </div>
            </div>

            {/* Enlace entidad */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center">
              <label className="text-sm font-medium text-gray-700 md:text-right md:pr-3">
                Enlace de la entidad
              </label>
              <div className="md:col-span-2">
                <input
                  className="w-full"
                  value={form.enlace_entidad}
                  onChange={e=>update("enlace_entidad", e.target.value)}
                />
              </div>
            </div>

          </form>

          {disabled && (
            <p className="mt-3 text-xs text-red-600">
              Para exportar, completa: <b>N° Plan de Mejora</b>, <b>Nombre Entidad</b> y <b>Fecha Inicio</b>.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
