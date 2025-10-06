import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export type Plan = {
  id: number;
  num_plan_mejora?: string | null;
  nombre_entidad: string;
  enlace_entidad?: string | null;
  estado?: string | null;
  created_by: number;
  created_at?: string | null;

  insumo_mejora?: string | null;
  tipo_accion_mejora?: string | null;
  accion_mejora_planteada?: string | null;
  descripcion_actividades?: string | null;
  evidencia_cumplimiento?: string | null;
  fecha_inicio?: string | null;
  fecha_final?: string | null;
  seguimiento?: string | null;
  observacion_calidad?: string | null;
  seguimientos?: Seguimiento[];
};

export type Seguimiento = {
  id?: number;
  plan_id?: number;

  observacion_informe_calidad?: string | null; // entidad
  insumo_mejora?: string | null;
  tipo_accion_mejora?: string | null;
  accion_mejora_planteada?: string | null;
  descripcion_actividades?: string | null;
  evidencia_cumplimiento?: string | null;
  fecha_inicio?: string | null;
  fecha_final?: string | null;
  seguimiento?: "Pendiente" | "En progreso" | "Finalizado" | string | null;
  enlace_entidad?: string | null;

  observacion_calidad?: string | null; // auditor/admin

  created_at?: string | null;
  updated_at?: string | null;
  updated_by_email?: string | null;
};

export type UnifiedForm = Seguimiento & {
  nombre_entidad: string;
  enlace_entidad?: string | null;
};

export const emptyForm = (): UnifiedForm => ({
  nombre_entidad: "",
  enlace_entidad: "",
  observacion_informe_calidad: "",
  observacion_calidad: "",
  insumo_mejora: "",
  tipo_accion_mejora: "",
  accion_mejora_planteada: "",
  descripcion_actividades: "",
  evidencia_cumplimiento: "",
  fecha_inicio: "",
  fecha_final: "",
  seguimiento: "Pendiente",
});

function toNull(v?: string | null) {
  return !v || v.trim() === "" ? null : v;
}

export function useSeguimientos() {
  const { user } = useAuth();
  const role = user?.role;
  const isEntidad = role === "entidad";
  const isAuditor = role === "auditor";
  const isAdmin = role === "admin";

  const actorEmail = useMemo(() => {
    const u: any = user;
    return u?.email ?? u?.sub ?? null;
  }, [user]);

  // PADRES
  const [createdOrder, setCreatedOrder] = useState<"asc" | "desc">("desc");const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);

  // HIJOS
  const [children, setChildren] = useState<Seguimiento[]>([]);

  // FORM unificado
  const [form, setForm] = useState<UnifiedForm>(emptyForm());

  useEffect(() => {
    (async () => {
      const data = await api("/seguimiento");
      setPlans(data);
    })();
  }, []);
  // ── util: parseo de fecha seguro
  function toDate(v?: string | null) {
    if (!v) return null;
    const d = v.length > 10 ? new Date(v) : new Date(v + "T00:00:00");
    return isNaN(+d) ? null : d;
  }

  // Lista ORDENADA para UI
  const sortedPlans = useMemo(() => {
    const arr = [...plans];
    const getTs = (p: Plan): number => {
      // 1) del plan
      const d1 = toDate((p as any).created_at ?? (p as any).createdAt);
      if (d1) return  d1.getTime();
      // 2) del primer seguimiento (si vino embebido)
      const firstSeg = p.seguimientos?.[0];
      const d2 = toDate((firstSeg as any)?.created_at ?? (firstSeg as any)?.createdAt);
      if (d2) return d2.getTime();
      // 3) fallback: id
      return p.id ?? 0;
    };
    arr.sort((a, b) => {
      const da = getTs(a);
      const db = getTs(b);
      return (da - db) * (createdOrder === "asc" ? 1 : -1);
    });
    return arr;
  }, [plans, createdOrder]);

  function toggleCreatedOrder() {
    setCreatedOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }

async function setActive(idxOrId: number) {
  const plan = plans.find((p) => p.id === idxOrId) ?? plans[idxOrId];
  if (!plan) return;

  setActivePlanId(plan.id);


  const segs: Seguimiento[] =
    plan.seguimientos && plan.seguimientos.length
      ? plan.seguimientos
      : await api(`/seguimiento/${plan.id}/seguimiento`);

  setChildren(segs);

  const first = segs[0];
  setForm({
    ...(first ?? emptyForm()),
    nombre_entidad: plan.nombre_entidad,
    enlace_entidad: plan.enlace_entidad ?? "",
    plan_id: plan.id,
  });
}


  function startNew() {
    setActivePlanId(null);
    setChildren([]);
    setForm(emptyForm());
  }

  function updateLocal<K extends keyof UnifiedForm>(key: K, value: UnifiedForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetCurrent() {
    setForm((prev) => ({
      ...emptyForm(),
      nombre_entidad: activePlanId ? prev.nombre_entidad : "",
      enlace_entidad: activePlanId ? prev.enlace_entidad : "",
      plan_id: activePlanId || undefined,
      id: undefined,
    }));
  }

 async function ensurePlanExists(): Promise<number> {
  if (activePlanId) return activePlanId;

  const nombre = form.nombre_entidad?.trim();
  if (!nombre) throw new Error("Ingresa el nombre de la entidad para crear el plan.");

  const planPayload = {
    nombre_entidad: nombre,
    enlace_entidad: toNull(form.enlace_entidad),
    estado: "Pendiente",
  };

  // crea el plan (el back ya crea 1 seguimiento inicial embebido)
  const created: Plan = await api("/seguimiento", {
    method: "POST",
    body: JSON.stringify(planPayload),
  });

  // agrega a la lista y marca activo
  setPlans((prev) => [created, ...prev]);
  setActivePlanId(created.id);

  // usa el seguimiento inicial si vino embebido; si no, refetch
  const segs = created.seguimientos && created.seguimientos.length
    ? created.seguimientos
    : await api(`/seguimiento/${created.id}/seguimiento`);

  setChildren(segs);

  const first = segs[0];
  setForm({
    ...(first ?? emptyForm()),
    plan_id: created.id,
    nombre_entidad: created.nombre_entidad,
    enlace_entidad: created.enlace_entidad ?? "",
  });

  return created.id;
}

  // Guardar seguimiento actual (acepta overrides)
  async function saveCurrent(overrides?: Partial<UnifiedForm>) {
    const base = overrides ? { ...form, ...overrides } : form;
    if (!base.nombre_entidad?.trim()) throw new Error("Ingresa el nombre de la entidad");
    const planId = await ensurePlanExists();

    const childPayload: Seguimiento = {
      observacion_informe_calidad: toNull(base.observacion_informe_calidad),
      insumo_mejora: toNull(base.insumo_mejora),
      tipo_accion_mejora: toNull(base.tipo_accion_mejora),
      accion_mejora_planteada: toNull(base.accion_mejora_planteada),
      descripcion_actividades: toNull(base.descripcion_actividades),
      evidencia_cumplimiento: toNull(base.evidencia_cumplimiento),
      fecha_inicio: toNull(base.fecha_inicio),
      fecha_final: toNull(base.fecha_final),
      seguimiento: base.seguimiento ?? "Pendiente",
      enlace_entidad: toNull(base.enlace_entidad),
      ...(isAuditor || isAdmin ? { observacion_calidad: toNull(base.observacion_calidad) } : {}),
    };

    let saved: Seguimiento;
    if (base.id) {
      saved = await api(`/seguimiento/${planId}/seguimiento/${base.id}`, {
        method: "PUT",
        body: JSON.stringify(childPayload),
      });
      // anota email del actor actual (solo UI)
      const withActor = { ...saved, updated_by_email: actorEmail };
      setChildren(prev => prev.map(x => (x.id === saved.id ? withActor : x)));
      saved = withActor;
    } else {
      saved = await api(`/seguimiento/${planId}/seguimiento`, {
        method: "POST",
        body: JSON.stringify(childPayload),
      });
      const withActor = { ...saved, updated_by_email: actorEmail };
      setChildren(prev => [...prev, withActor]);
      saved = withActor;
    }

    setForm((prev) => ({
      ...prev,
      ...(overrides ? { ...saved, ...overrides } : saved),
      plan_id: planId,
      nombre_entidad: prev.nombre_entidad,
      enlace_entidad: prev.enlace_entidad,
    }));
    return saved;
  }

  // Crear seguimiento inmediatamente (para "Agregar" instantáneo)
  async function addChildImmediate() {
    const planId = await ensurePlanExists();
    const payload: Seguimiento = { seguimiento: "Pendiente" };
    const created: Seguimiento = await api(`/seguimiento/${planId}/seguimiento`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setChildren((prev) => [...prev, created]);
    setForm((prev) => ({
      ...prev,
      ...created,
      plan_id: planId,
      nombre_entidad: prev.nombre_entidad,
      enlace_entidad: prev.enlace_entidad,
    }));
    return created;
  }

  // Eliminar seguimiento
  async function removeById(id: number) {
    if (!activePlanId || !id) return;
    await api(`/seguimiento/${activePlanId}/seguimiento/${id}`, { method: "DELETE" });
    setChildren((prev) => prev.filter((x) => x.id !== id));
    if (form.id === id) {
      setForm((prev) => ({
        ...emptyForm(),
        nombre_entidad: prev.nombre_entidad,
        enlace_entidad: prev.enlace_entidad,
        plan_id: activePlanId!,
      }));
    }
  }

  // 👉 Eliminar plan (padre) y limpiar UI
  async function removePlan(id?: number) {
    const planId = id ?? activePlanId;
    if (!planId) return;
    await api(`/seguimiento/${planId}`, { method: "DELETE" }); // ajusta endpoint si difiere
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    if (activePlanId === planId) {
      setActivePlanId(null);
      setChildren([]);
      setForm(emptyForm());
    }
  }

  // Seleccionar hijo por índice (0-based)
  function setActiveChild(i: number) {
    if (!children.length) return;
    const safe = Math.max(0, Math.min(i, children.length - 1));
    const child = children[safe];
    if (!child) return;
    setForm((prev) => ({
      ...emptyForm(),                     
      ...child,                          
      plan_id: activePlanId ?? child.plan_id,
      nombre_entidad: prev.nombre_entidad,
      enlace_entidad: prev.enlace_entidad,
      evidencia_cumplimiento: child.evidencia_cumplimiento ?? "",
      observacion_informe_calidad: child.observacion_informe_calidad ?? "",
      observacion_calidad: child.observacion_calidad ?? "",
      insumo_mejora: child.insumo_mejora ?? "",
      tipo_accion_mejora: child.tipo_accion_mejora ?? "",
      accion_mejora_planteada: child.accion_mejora_planteada ?? "",
      descripcion_actividades: child.descripcion_actividades ?? "",
      fecha_inicio: child.fecha_inicio ?? "",
      fecha_final: child.fecha_final ?? "",
      seguimiento: child.seguimiento ?? "Pendiente",
    }));
  }

  const rows = useMemo(() => {
    return sortedPlans.map((p, idx) => ({
      "#": idx + 1,
      Plan: p.num_plan_mejora ?? "—",
      Entidad: p.nombre_entidad,
      "Fecha Inicio": p.fecha_inicio ?? "—",
      Seguimiento: p.seguimiento ?? "—",
      Estado: p.estado ?? "—",
    }));
  }, [sortedPlans]);

  const isDuplicableCurrent = !!form.nombre_entidad?.trim();
  const indexInChildren = form.id ? Math.max(0, children.findIndex((c) => c.id === form.id)) : 0;
  const pagerIndex = activePlanId ? indexInChildren : 0;
  const pagerTotal = activePlanId ? Math.max(1, children.length || 1) : 1;

  return {
    plans: sortedPlans,
    rows,
    activePlanId,
    setActive,

    children,
    current: form,
    updateLocal,
    resetCurrent,
    startNew,
    saveCurrent,
    removeById,
    addChildImmediate,
    removePlan,         

    setActiveChild,
    isDuplicableCurrent,
    pagerIndex,
    pagerTotal,
    role,
    createdOrder,
    toggleCreatedOrder,
  };
}
