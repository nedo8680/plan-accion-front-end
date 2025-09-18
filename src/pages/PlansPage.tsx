import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { FaCheck, FaClock, FaHourglass, FaPlay } from "react-icons/fa";

type Plan = {
  id: number;
  num_plan_mejora: string;
  nombre_entidad: string;
  observacion_informe_calidad?: string;
  insumo_mejora?: string;
  tipo_accion_mejora?: string;
  accion_mejora_planteada?: string;
  descripcion_actividades?: string;
  evidencia_cumplimiento?: string;
  fecha_inicio?: string;
  fecha_final?: string;
  seguimiento?: string;
  enlace_entidad?: string;
  estado?: string;
  created_by: number;
};

export default function PlansPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Plan>>({
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

  async function load() {
    setLoading(true); setErr(null);
    try {
      const data = await api("/plans");
      setItems(data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form };
      const data = await api("/plans", { method: "POST", body: JSON.stringify(payload) });
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
      setItems(prev => [data, ...prev]);
    } catch (e: any) {
      alert(e.message || "Error creando plan");
    }
  }

  async function changeEstado(id: number, estado: string) {
    try {
      const data = await api(`/plans/${id}/estado?estado=${encodeURIComponent(estado)}`, { method: "POST" });
      setItems(prev => prev.map(p => p.id === id ? data : p));
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl p-4">
        <h1 className="mb-4 text-2xl font-semibold">Planes de Acción</h1>
        {err && <p className="text-sm text-red-600">{err}</p>}

        {/* Formulario */}
        <div className="card mb-6">
          <h2 className="mb-3 text-lg font-semibold">Crear Plan</h2>
          <form onSubmit={createPlan} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label>N° Plan de Mejora</label>
              <input value={form.num_plan_mejora||""} onChange={e=>setForm(f=>({...f, num_plan_mejora:e.target.value}))} required />
            </div>
            <div className="space-y-1">
              <label>Nombre Entidad</label>
              <input value={form.nombre_entidad||""} onChange={e=>setForm(f=>({...f, nombre_entidad:e.target.value}))} required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label>Observación del informe de calidad</label>
              <textarea value={form.observacion_informe_calidad||""} onChange={e=>setForm(f=>({...f, observacion_informe_calidad:e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label>Insumo de mejora</label>
              <input value={form.insumo_mejora||""} onChange={e=>setForm(f=>({...f, insumo_mejora:e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label>Tipo de acción de mejora</label>
              <input value={form.tipo_accion_mejora||""} onChange={e=>setForm(f=>({...f, tipo_accion_mejora:e.target.value}))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label>Acción de mejora planteada</label>
              <input value={form.accion_mejora_planteada||""} onChange={e=>setForm(f=>({...f, accion_mejora_planteada:e.target.value}))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label>Descripción de las actividades</label>
              <textarea value={form.descripcion_actividades||""} onChange={e=>setForm(f=>({...f, descripcion_actividades:e.target.value}))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label>Evidencia de cumplimiento (URL)</label>
              <input value={form.evidencia_cumplimiento||""} onChange={e=>setForm(f=>({...f, evidencia_cumplimiento:e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label>Fecha Inicio</label>
              <input type="date" value={form.fecha_inicio||""} onChange={e=>setForm(f=>({...f, fecha_inicio:e.target.value}))} />
            </div>
            <div className="space-y-1">
              <label>Fecha Final</label>
              <input type="date" value={form.fecha_final||""} onChange={e=>setForm(f=>({...f, fecha_final:e.target.value}))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label>Seguimiento</label>
              <select value={form.seguimiento||"Pendiente"} onChange={e=>setForm(f=>({...f, seguimiento:e.target.value}))}>
                <option>Pendiente</option>
                <option>En progreso</option>
                <option>Finalizado</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label>Enlace de la entidad</label>
              <input value={form.enlace_entidad||""} onChange={e=>setForm(f=>({...f, enlace_entidad:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn">Guardar</button>
            </div>
          </form>
        </div>

        {/* Tabla */}
        {loading ? (
          <p className="text-gray-600">Cargando…</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="p-2">ID</th>
                  <th className="p-2">N° Plan</th>
                  <th className="p-2">Entidad</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Seguimiento</th>
                  <th className="p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2">{p.id}</td>
                    <td className="p-2">{p.num_plan_mejora}</td>
                    <td className="p-2">{p.nombre_entidad}</td>
                    <td className="p-2">{p.estado}</td>
                    <td className="p-2">{p.seguimiento}</td>
                    <td className="p-2">
                      {isAdmin ? (
                        <div className="flex flex-wrap gap-2">
                          <button onClick={()=>changeEstado(p.id, "En progreso")} className="btn-outline">
                            <FaPlay /> En progreso
                          </button>
                          <button onClick={()=>changeEstado(p.id, "Finalizado")} className="btn-outline">
                            <FaCheck /> Finalizado
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td className="p-3 text-gray-500" colSpan={6}>Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
