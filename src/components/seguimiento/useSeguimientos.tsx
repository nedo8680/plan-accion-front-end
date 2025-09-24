import { useMemo, useState } from "react";

export type TipoAccion = "" | "Preventiva" | "Correctiva";
export type InsumoMejora =
  | ""
  | "Índice de Calidad a las Respuestas"
  | "Peticiones Vencidas en el Sistema";

export type Seguimiento = {
  nombre_entidad: string;
  observacion_informe_calidad: string;
  insumo_mejora: InsumoMejora;         
  tipo_accion_mejora: TipoAccion;       
  accion_mejora_planteada: string;
  descripcion_actividades: string;
  evidencia_cumplimiento: string;
  fecha_inicio: string;
  fecha_final: string;
  seguimiento: "Pendiente" | "En progreso" | "Finalizado";
  enlace_entidad: string;
};

export const emptySeguimiento = (): Seguimiento => ({
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

export function useSeguimientos() {
  const [items, setItems] = useState<Seguimiento[]>([emptySeguimiento()]);
  const [active, setActive] = useState(0);
  const current = items[active];

  function update<K extends keyof Seguimiento>(key: K, value: Seguimiento[K]) {
    setItems((prev) => {
      const next = [...prev];
      next[active] = { ...next[active], [key]: value };
      return next;
    });
  }

  function resetCurrent() {
    setItems((prev) => {
        const next = [...prev];
        next[active] = {...emptySeguimiento(),
        nombre_entidad: prev[active].nombre_entidad,
        enlace_entidad: prev[active].enlace_entidad 
      };
      return next;
    });
  }

  function duplicate() {
   setItems((prev) => {
    const base = prev[active];
    const nextItem: Seguimiento = {
      ...emptySeguimiento(),
      nombre_entidad: base.nombre_entidad,
      enlace_entidad: base.enlace_entidad,
      insumo_mejora: base.insumo_mejora,
      tipo_accion_mejora: base.tipo_accion_mejora,
      accion_mejora_planteada: base.accion_mejora_planteada,
      descripcion_actividades: base.descripcion_actividades,
      evidencia_cumplimiento: base.evidencia_cumplimiento,
      fecha_inicio: base.fecha_inicio,
      fecha_final: base.fecha_final,
      seguimiento: base.seguimiento,
      observacion_informe_calidad: base.observacion_informe_calidad,
    };

    const next = [...prev];
    next.splice(active + 1, 0, nextItem);
    return next;
  });
  setActive((i) => i + 1);
  }

  function remove() {
    setItems((prev) => {
      if (prev.length === 1) return [emptySeguimiento()];
      const next = prev.filter((_, i) => i !== active);
      setActive((i) => Math.max(0, i - 1));
      return next;
    });
  }

  const isValid = (s: Seguimiento) =>
    s.nombre_entidad.trim() !== "" && s.fecha_inicio.trim() !== "";

  const isDuplicable = (s: Seguimiento) => s.nombre_entidad.trim() !== "";

  const rows = useMemo(() => {
    return items
      .filter(isValid)
      .map((s, idx) => ({
        "#": idx + 1,
        "Entidad": s.nombre_entidad,
        "Obs. Informe de Calidad": s.observacion_informe_calidad,
        "Insumo de mejora": s.insumo_mejora,
        "Tipo de acción": s.tipo_accion_mejora,
        "Acción planteada": s.accion_mejora_planteada,
        "Descripción actividades": s.descripcion_actividades,
        "Evidencia (URL)": s.evidencia_cumplimiento,
        "Fecha Inicio": s.fecha_inicio,
        "Fecha Final": s.fecha_final,
        "Seguimiento": s.seguimiento,
        "Enlace entidad": s.enlace_entidad,
      }));
  }, [items]);

  return {
    items,
    active,
    setActive,
    current,
    update,
    resetCurrent,
    duplicate,
    remove,
    isValidCurrent: isValid(current),
    isDuplicableCurrent: isDuplicable(current),
    rows,
  };
}
