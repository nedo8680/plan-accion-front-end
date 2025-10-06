import type { Plan, Seguimiento } from "./useSeguimientos";

type ColKey =
  | keyof Seguimiento
  | "updated_by_email"
  | "nombre_entidad"
  | "enlace_entidad";

type Col = { key: ColKey; title: string };

export function buildSeguimientoDataset(plan: Plan | null, items: Seguimiento[]) {
  const cols: Col[] = [
    { key: "id",                 title: "ID" },
    { key: "nombre_entidad",     title: "Nombre entidad" },  
    { key: "enlace_entidad",     title: "Enlace entidad" },   
    { key: "seguimiento",        title: "Estado" },
    { key: "insumo_mejora",      title: "Insumo" },
    { key: "tipo_accion_mejora", title: "Tipo" },
    { key: "accion_mejora_planteada", title: "Acción" },
    { key: "descripcion_actividades", title: "Descripción" },
    { key: "evidencia_cumplimiento",  title: "Evidencia" },
    { key: "fecha_inicio",       title: "F. Inicio" },
    { key: "fecha_final",        title: "F. Final" },
    { key: "observacion_calidad",title: "Obs. calidad" },
    { key: "updated_by_email",   title: "Actualizado por" },
  ];

  const rows = items.map((s) => ({
    id: s.id ?? "",
    nombre_entidad: plan?.nombre_entidad ?? "",       
    enlace_entidad: plan?.enlace_entidad ?? "",       
    seguimiento: s.seguimiento ?? "",
    insumo_mejora: s.insumo_mejora ?? "",
    tipo_accion_mejora: s.tipo_accion_mejora ?? "",
    accion_mejora_planteada: s.accion_mejora_planteada ?? "",
    descripcion_actividades: s.descripcion_actividades ?? "",
    evidencia_cumplimiento: s.evidencia_cumplimiento ?? "",
    fecha_inicio: s.fecha_inicio ?? "",
    fecha_final: s.fecha_final ?? "",
    observacion_calidad: s.observacion_calidad ?? "",
    updated_by_email: (s as any).updated_by_email ?? "",
  }));

  const title = plan ? `Plan ${plan.id} — ${plan.nombre_entidad}` : "Seguimientos";
  return { cols, rows, title };
}

export function exportSeguimientosCSV(plan: Plan | null, items: Seguimiento[]) {
  const { cols, rows, title } = buildSeguimientoDataset(plan, items);
  if (!rows.length) { alert("Este plan no tiene seguimientos para exportar."); return; }

  const headers = cols.map(c => c.title);
  const esc = (val: any) => {
    const v = (val ?? "").toString().replace(/\r?\n|\r/g, " ").trim();
    return /[\",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  };
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map((_, i) => {
      const key = cols[i].key as any;
      return esc((r as any)[key]);
    }).join(",")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url; a.download = `${title.replace(/\s+/g, "_")}_${today}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export async function exportSeguimientosXLSX(plan: Plan | null, items: Seguimiento[]) {
  const { cols, rows, title } = buildSeguimientoDataset(plan, items);
  if (!rows.length) { alert("Este plan no tiene seguimientos para exportar."); return; }

  const xlsx = await import("xlsx");
  const head = [cols.map(c => c.title)];
  const body = rows.map(r => cols.map(c => (r as any)[c.key] ?? ""));

  const ws = xlsx.utils.aoa_to_sheet([...head, ...body]);
  // anchos un poco más amplios para columnas largas
  ws["!cols"] = cols.map((c, idx) => {
    const base = Math.max(14, c.title.length + 2);
    // dar más ancho a algunas columnas
    const wide =
      idx === 1 /* Nombre entidad */ ? 36 :
      idx === 2 /* Enlace entidad */ ? 42 :
      idx === 6 /* Acción */          ? 30 :
      idx === 7 /* Descripción */     ? 36 :
      idx === 8 /* Evidencia */       ? 32 :
      idx === 11/* Obs. calidad */    ? 36 :
      base;
    return { wch: wide };
  });

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Seguimientos");

  const today = new Date().toISOString().slice(0, 10);
  xlsx.writeFile(wb, `${title.replace(/\s+/g, "_")}_${today}.xlsx`);
}

export async function exportSeguimientosPDF(plan: Plan | null, items: Seguimiento[]) {
  const { cols, rows, title } = buildSeguimientoDataset(plan, items);
  if (!rows.length) { alert("Este plan no tiene seguimientos para exportar."); return; }

  const [{ default: jsPDF }, auto] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  const margin = 36; // 0.5"
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(title, margin, margin);

  const head = [cols.map(c => c.title)];
  const body = rows.map(r => cols.map(c => (r as any)[c.key] ?? ""));

  // anchos pensados para que NO apile letras
  // idx: 0..12 (ver orden de cols arriba)
  const columnStyles: Record<number, any> = {
    0:  { cellWidth: 28 },   // ID
    1:  { cellWidth: 160 },  // Nombre entidad
    2:  { cellWidth: 190 },  // Enlace entidad
    3:  { cellWidth: 80 },   // Estado
    4:  { cellWidth: 150 },  // Insumo
    5:  { cellWidth: 70 },   // Tipo
    6:  { cellWidth: 130 },  // Acción
    7:  { cellWidth: 210 },  // Descripción
    8:  { cellWidth: 190 },  // Evidencia
    9:  { cellWidth: 80 },   // F. Inicio
    10: { cellWidth: 80 },   // F. Final
    11: { cellWidth: 210 },  // Obs. calidad
    12: { cellWidth: 130 },  // Actualizado por
  };

  (auto as any).default(doc, {
    startY: margin + 12,
    margin: { left: margin, right: margin, top: margin, bottom: margin },
    head,
    body,
    theme: "grid",
    tableWidth: "wrap",
    rowPageBreak: "auto",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 4,
      overflow: "linebreak",
      valign: "top",
      halign: "left",
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [10, 47, 90],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles,
    didDrawPage: (data: any) => {
      // título en cada página
      doc.setFontSize(12);
      doc.text(title, margin, margin);
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  doc.save(`${title.replace(/\s+/g, "_")}_${today}.pdf`);
}