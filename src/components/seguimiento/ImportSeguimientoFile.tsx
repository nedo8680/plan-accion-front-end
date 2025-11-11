import React, { useRef, useState, useEffect } from "react";
import { api } from "../../lib/api";

type Props = {
  onImport: (data: { entidad?: string; indicador?: string; accion?: string }) => void;
};

export default function ImportSeguimientoFile({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // mostramos el nombre mientras procesamos
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
      // limpiar el input real
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      // limpiar el nombre mostrado
      setTimeout(() => setFileName(""), 4000);
    }
  };

  // ===== Auto-check: consultar /reports/latest una vez al montar
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        //const MOCKAROO_URL = "https://my.api.mockaroo.com/reports.json?key=e7b6daf0";
        //const resp = await fetch(MOCKAROO_URL, { method: "GET", mode: "cors" });
        //const res = await resp.json();
        const res = await api("/reports/latest");
        if (!mounted || !res) return;

        // Normalizar: la API puede devolver un objeto o un array
        const obj = Array.isArray(res) ? res[0] : res;
        if (!obj || typeof obj !== "object") return;

        // Helper: buscar clave ignorando mayúsculas
        const findKey = (candidates: string[]) => {
          for (const k of Object.keys(obj)) {
            const lk = k.toLowerCase();
            if (candidates.includes(lk)) return (obj as any)[k];
          }
          return undefined;
        };

        const entidad = findKey(["entidad", "nombre_entidad", "nombre"]);
        const indicador = findKey(["indicador", "indicador_nombre", "nombre_indicador"]);
        const accion = findKey(["accion", "accion_mejora_planteada", "accion_planteada"]);

        if (entidad || indicador || accion) {
          onImport({
            entidad: entidad != null ? String(entidad) : undefined,
            indicador: indicador != null ? String(indicador) : undefined,
            accion: accion != null ? String(accion) : undefined,
          });
          setFileName("Importado desde API");
          setTimeout(() => setFileName(""), 4000);
        }
      } catch (e) {
        // Silencioso: no bloquear flujo si backend no responde
      }
    })();

    return () => {
      mounted = false;
    };
  }, [onImport]);


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
