import type { Plan, Seguimiento } from "./useSeguimientos";

type ColKey =
  | keyof Seguimiento
  | "updated_by_email"
  | "nombre_entidad"
  | "enlace_entidad"
  | "estado"
  | "plan_descripcion_actividades"
  | "plan_evidencia_cumplimiento";

type Col = { key: ColKey; title: string };

export function buildSeguimientoDataset(plan: Plan | null, items: Seguimiento[]) {
  const cols: Col[] = [
    { key: "id",                       title: "ID seguimiento" },
    { key: "plan_id",                  title: "ID plan" },
    { key: "estado",                   title: "Estado plan" },
    { key: "nombre_entidad",           title: "Nombre entidad" },  
    { key: "enlace_entidad",           title: "Enlace entidad" },   
    { key: "indicador",                title: "Indicador" },
    { key: "insumo_mejora",            title: "Insumo de mejora" },
    { key: "tipo_accion_mejora",       title: "Tipo de acción" },
    { key: "observacion_informe_calidad", title: "Acción recomendada (Informe calidad)" },
    { key: "accion_mejora_planteada",  title: "Acción de mejora planteada" },
    { key: "plan_descripcion_actividades", title: "Descripción de actividades (Plan)" },
    { key: "plan_evidencia_cumplimiento",  title: "Evidencia plan (texto)" },
    { key: "fecha_inicio",             title: "F. Inicio plan" },
    { key: "fecha_final",              title: "F. Final plan" },
    { key: "fecha_reporte",            title: "F. reporte seguimiento" },
    { key: "seguimiento",              title: "Estado seguimiento" },
    { key: "descripcion_actividades",  title: "Actividades realizadas" },
    { key: "evidencia_cumplimiento",   title: "Evidencia (archivo/url)" },
    { key: "observacion_calidad",      title: "Obs. DDCS" },
    { key: "updated_by_email",         title: "Actualizado por" },
    { key: "created_at",               title: "Creado en" },
    { key: "updated_at",               title: "Actualizado en" },
  ];

  const rows = items.map((s) => ({
    id: s.id ?? "",
    plan_id: plan?.id ?? s.plan_id ?? "",
    estado: plan?.estado ?? "",
    nombre_entidad: plan?.nombre_entidad ?? "",       
    enlace_entidad: plan?.enlace_entidad ?? "",       
    indicador: plan?.indicador ?? s.indicador ?? "",
    insumo_mejora: plan?.insumo_mejora ?? s.insumo_mejora ?? "",
    tipo_accion_mejora: plan?.tipo_accion_mejora ?? s.tipo_accion_mejora ?? "",
    observacion_informe_calidad: s.observacion_informe_calidad ?? "",
    accion_mejora_planteada: plan?.accion_mejora_planteada ?? s.accion_mejora_planteada ?? "",
    plan_descripcion_actividades: plan?.descripcion_actividades ?? (s as any).plan_descripcion_actividades ?? "",
    plan_evidencia_cumplimiento: plan?.evidencia_cumplimiento ?? (s as any).plan_evidencia_cumplimiento ?? "",
    fecha_inicio: plan?.fecha_inicio ?? s.fecha_inicio ?? "",
    fecha_final: plan?.fecha_final ?? s.fecha_final ?? "",
    fecha_reporte: s.fecha_reporte ?? "",
    seguimiento: s.seguimiento ?? "",
    descripcion_actividades: s.descripcion_actividades ?? "",
    evidencia_cumplimiento: s.evidencia_cumplimiento ?? "",
    observacion_calidad: s.observacion_calidad ?? "",
    updated_by_email: (s as any).updated_by_email ?? "",
    created_at: s.created_at ?? "",
    updated_at: s.updated_at ?? "",
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
    // dar más ancho a algunas columnas clave
    const widthMap: Record<number, number> = {
      3: 36,  // Nombre entidad
      4: 42,  // Enlace entidad
      5: 28,  // Indicador
      6: 24,  // Insumo
      8: 32,  // Acción recomendada
      9: 32,  // Acción de mejora
      10: 42, // Desc actividades plan
      11: 42, // Evidencia plan
      16: 38, // Actividades seg
      17: 32, // Evidencia seg
      18: 32, // Obs DDCS
      19: 28, // Actualizado por
    };
    return { wch: widthMap[idx] ?? base };
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
  // A3 para mayor ancho y evitar cortes de columnas
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a3" });

  const margin = 28; // un poco más de ancho útil
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(title, margin, margin);

  const head = [cols.map(c => c.title)];
  const body = rows.map(r => cols.map(c => (r as any)[c.key] ?? ""));

  (auto as any).default(doc, {
    startY: margin + 12,
    margin: { left: margin, right: margin, top: margin, bottom: margin },
    head,
    body,
    theme: "grid",
    tableWidth: "wrap",
    horizontalPageBreak: true,
    rowPageBreak: "auto",
    styles: {
      font: "helvetica",
      fontSize: 6,
      cellPadding: 2,
      overflow: "linebreak",
      cellWidth: "wrap",
      valign: "top",
      halign: "left",
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: [10, 47, 90],
      textColor: 255,
      fontStyle: "bold",
    },
    didDrawPage: (data: any) => {
      // título en cada página
      doc.setFontSize(12);
      doc.text(title, margin, margin);
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  doc.save(`${title.replace(/\s+/g, "_")}_${today}.pdf`);
}
