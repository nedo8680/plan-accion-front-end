import React, { useRef, useState, useEffect } from "react";
import { api } from "../../lib/api";

type IndicadorApiRow = {
  entidad: string | undefined;
  indicador: string | undefined;
  accion: string | undefined;
};

type Props = {
  onImport: (data: { entidad?: string; indicador?: string; accion?: string }) => void;
  onOptionsFromApi?: (rows: IndicadorApiRow[]) => void;
};
const FALLBACK_ROWS: IndicadorApiRow[] = [
  {
    entidad: "Entidad de Prueba 1",
    indicador: "Indicador de satisfacción",
    accion: "Realizar encuesta trimestral a los usuarios",
  },
  {
    entidad: "Entidad de Prueba 2",
    indicador: "Tiempo de respuesta a PQRS",
    accion: "Implementar tablero de monitoreo diario",
  },
];

export default function ImportSeguimientoFile({ onImport, onOptionsFromApi }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const name = file.name.toLowerCase();

    try {
      if (name.endsWith(".csv")) {
        const text = await file.text();
        const [headerLine, ...rows] = text
          .split(/\r?\n/)
          .map((x) => x.trim())
          .filter(Boolean);

        const headers = headerLine
          .split(",")
          .map((h) => h.trim().toLowerCase());

        const row1 = rows[0]?.split(",") || [];

        const getVal = (label: string) => {
          const idx = headers.findIndex((h) => h === label.toLowerCase());
          return idx >= 0 ? row1[idx]?.trim() : undefined;
        };

        onImport({
          entidad: getVal("entidad"),
          indicador: getVal("indicador"),
          accion: getVal("accion"),
        });
      } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const XLSX = await import("xlsx");
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const first = json[0] || {};

        const norm: Record<string, any> = {};
        Object.keys(first).forEach((k) => {
          norm[k.toLowerCase()] = first[k];
        });

        onImport({
          entidad: norm["entidad"],
          indicador: norm["indicador"],
          accion: norm["accion"],
        });
      } else {
        alert("Formato no soportado. Usa CSV o Excel.");
      }
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setTimeout(() => setFileName(""), 4000);
    }
  };

  // ===== Auto-check: consultar Mockaroo una vez al montar
  useEffect(() => {
    let mounted = true;

    const fetchReport = async () => {
      try {
        const nombreEntidad = "Entidad de prueba"; 

        const res: any = await api(
          `/reports/${encodeURIComponent(nombreEntidad)}`
        );
        console.log("ImportSeguimientoFile: /reports/{nombre_entidad}", res);

        if (!mounted || !res) return;


        const toRowsFromObj = (obj: any): IndicadorApiRow[] => {
          if (!obj || typeof obj !== "object") return [];

          if (Array.isArray(obj.indicadores)) {
            const entidad =
              obj.entidad || obj.nombre_entidad || obj.nombre || undefined;

            return obj.indicadores.map((item: any) => ({
              entidad: entidad ? String(entidad) : undefined,
              indicador: item?.indicador != null ? String(item.indicador) : undefined,
              accion: item?.accion != null ? String(item.accion) : undefined,
            }));
          }

          
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
          const indicador = findKey(["indicador", "indicador_nombre", "nombre_indicador"]);
          const accion = findKey(["accion", "accion_mejora_planteada", "accion_planteada"]);

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

        if (!normalized.length) {
          if (onOptionsFromApi && mounted) onOptionsFromApi(FALLBACK_ROWS);
          return;
        }

        if (onOptionsFromApi && mounted) {
          onOptionsFromApi(normalized);
        }

        const first = normalized[0];
        if (first && (first.entidad || first.indicador || first.accion)) {
          onImport({
            entidad: first.entidad,
            indicador: first.indicador,
            accion: first.accion,
          });
          setFileName("Importado desde API");
          setTimeout(() => setFileName(""), 4000);
        }
      } catch (e) {
        console.error("ImportSeguimientoFile: error al llamar /reports/{nombre_entidad}", e);

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
          setFileName("Datos de ejemplo (sincronización externa no disponible)");
          setTimeout(() => setFileName(""), 4000);
        }
      }
    };

    fetchReport();
    return () => {
      mounted = false;
    };
  }, [onOptionsFromApi]);



  return (
    <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-white/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">
            Importar datos de seguimiento
          </p>
          <p className="text-xs text-gray-500">
            Sube un archivo con las columnas: <b>entidad</b>, <b>indicador</b>, <b>accion</b>.
          </p>
          {fileName ? (
            <p className="mt-1 text-xs text-gray-500 font-bold">
              Procesando: {fileName}...
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleSelect}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Seleccionar archivo
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
