import React, { useEffect } from "react";
import { api } from "../../lib/api";

export type IndicadorApiRow = {
  entidad: string | undefined;
  indicador: string | undefined;
  accion: string | undefined;
};

type Props = {
  onImport: (data: { entidad?: string; indicador?: string; accion?: string }) => void;
  onOptionsFromApi?: (rows: IndicadorApiRow[]) => void;
  nombreEntidad?: string | null;
};

const FALLBACK_ROWS: IndicadorApiRow[] = [
  {
    entidad: "Administrador",
    indicador: "Indicador de satisfacción",
    accion: "Realizar encuesta trimestral a los usuarios",
  },
  {
    entidad: "Administrador",
    indicador: "Tiempo de respuesta a PQRS",
    accion: "Implementar tablero de monitoreo diario",
  },
];

export default function IndicadoresAutoLoader({
  onImport,
  onOptionsFromApi,
  nombreEntidad,
}: Props) {
  useEffect(() => {
    let mounted = true;

    const fetchReport = async () => {
      try {
        if (!nombreEntidad) return;

        const res: any = await api(
          `/reports/${encodeURIComponent(nombreEntidad)}`
        );
        if (!mounted || !res) return;

        const toRowsFromObj = (obj: any): IndicadorApiRow[] => {
          if (!obj || typeof obj !== "object") return [];

          // Caso actual del backend: { entidad, indicadores: [{ indicador, accion }, ...] }
          if (Array.isArray(obj.indicadores)) {
            const entidad =
              obj.entidad || obj.nombre_entidad || obj.nombre || undefined;

            return obj.indicadores.map((item: any) => ({
              entidad: entidad ? String(entidad) : undefined,
              indicador:
                item?.indicador != null ? String(item.indicador) : undefined,
              accion: item?.accion != null ? String(item.accion) : undefined,
            }));
          }

          // Fallback: formato plano tipo Mockaroo anterior
          const lowerObj: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(obj)) {
            lowerObj[k.toLowerCase()] = v;
          }

          const findKey = (candidates: string[]) => {
            for (const c of candidates) {
              if (c in lowerObj) return lowerObj[c];
            }
            return undefined;
          };

          const entidad = findKey(["entidad", "nombre_entidad", "nombre"]);
          const indicador = findKey([
            "indicador",
            "indicador_nombre",
            "nombre_indicador",
          ]);
          const accion = findKey([
            "accion",
            "accion_mejora_planteada",
            "accion_planteada",
          ]);

          if (!entidad && !indicador && !accion) return [];

          return [
            {
              entidad: entidad != null ? String(entidad) : undefined,
              indicador: indicador != null ? String(indicador) : undefined,
              accion: accion != null ? String(accion) : undefined,
            },
          ];
        };

        const arrayObjs = Array.isArray(res) ? res : [res];

        const normalized: IndicadorApiRow[] = arrayObjs
          .flatMap((obj: any) => toRowsFromObj(obj))
          .filter((x): x is IndicadorApiRow => !!x);

        // Si no vino nada útil, usamos fallback
        if (!normalized.length) {
          if (onOptionsFromApi && mounted) onOptionsFromApi(FALLBACK_ROWS);
          return;
        }

        // Opciones para el <select> de Indicador
        if (onOptionsFromApi && mounted) {
          onOptionsFromApi(normalized);
        }

        // Autorrellenar el form con la primera fila
        const first = normalized[0];
        if (first && (first.entidad || first.indicador || first.accion)) {
          onImport({
            entidad: first.entidad,
            indicador: first.indicador,
            accion: first.accion,
          });
        }
      } catch (e) {
        console.error(
          "IndicadoresAutoLoader: error al llamar /reports/{nombre_entidad}",
          e
        );

        if (onOptionsFromApi && mounted) {
          onOptionsFromApi(FALLBACK_ROWS);
        }
        const first = FALLBACK_ROWS[0];
        if (first) {
          onImport({
            entidad: first.entidad,
            indicador: first.indicador,
            accion: first.accion,
          });
        }
      }
    };

    fetchReport();

    return () => {
      mounted = false;
    };
  }, [nombreEntidad, onOptionsFromApi]);

  
  return null;
}
