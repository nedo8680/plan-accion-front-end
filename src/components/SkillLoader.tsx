import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { api } from "../lib/api";

type Props = { onProcessed?: () => void };

const expectedCols = [
  "Año", "Mes", "Id_Entidad", "Entidad",
  "Pct_Tecnicas", "Cap_Tecnicas",
  "Pct_Socioemocionales", "Cap_Socioemocionales",
];

export default function Dim6Uploader({ onProcessed }: Props) {
  const [fileInfo, setFileInfo] = useState<any[] | null>(null);
  const [validFile, setValidFile] = useState(false);

  const [validRows, setValidRows] = useState<any[]>([]);
  const [invalidRows, setInvalidRows] = useState<any[]>([]);
  const [hasValidationIssues, setHasValidationIssues] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9_]/g, "");

  // -----------------------------
  // LECTURA
  // -----------------------------
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let data: any[] = [];

      if (ext === "xlsx" || ext === "xls") {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer);
        data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      } else if (ext === "csv") {
        const text = await file.text();
        data = XLSX.utils.sheet_to_json(
          XLSX.read(text, { type: "string" }).Sheets.Sheet1
        );
      } else {
        alert("Formato no soportado");
        resetInput();
        return;
      }

      // columnas obligatorias
      const cleaned = Object.keys(data[0] || {}).map(clean);
      const expected = expectedCols.map(clean);

      if (!expected.every((x) => cleaned.includes(x))) {
        alert("Estructura incorrecta. Verifica columnas.");
        resetInput();
        return;
      }

      validarFilas(data);

      setFileInfo(data);
      setValidFile(true);

    } catch (err: any) {
      alert("Error: " + err.message);
      resetInput();
    }
  };

  // -----------------------------
  // VALIDACIÓN
  // -----------------------------
  const validarFilas = (rows: any[]) => {
    const val: any[] = [];
    const inval: any[] = [];

    rows.forEach((r, i) => {
      const pctT = r["Pct_Tecnicas"];
      const capT = r["Cap_Tecnicas"];
      const pctS = r["Pct_Socioemocionales"];
      const capS = r["Cap_Socioemocionales"];

      const missing = pctT === undefined || capT === undefined || pctS === undefined || capS === undefined;

      const notNumeric =
        isNaN(Number(pctT)) ||
        isNaN(Number(capT)) ||
        isNaN(Number(pctS)) ||
        isNaN(Number(capS));

      if (missing || notNumeric) {
        inval.push({ fila: i + 1, ...r });
      } else {
        val.push(r);
      }
    });

    setValidRows(val);
    setInvalidRows(inval);
    setHasValidationIssues(inval.length > 0);
  };

  const resetInput = () => {
    setFileInfo(null);
    setValidFile(false);
    setValidRows([]);
    setInvalidRows([]);
    setHasValidationIssues(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  // -----------------------------
  // PROCESAR SOLO FILAS VÁLIDAS
  // -----------------------------
  const procesar = async () => {
    if (!validRows.length) {
      alert("No hay filas válidas para procesar.");
      return;
    }

    const renamed = validRows.map((row) => ({
      anio: row["Año"],
      mes: row["Mes"],
      id_entidad: row["Id_Entidad"],
      entidad: row["Entidad"],
      pct_habilidades_tecnicas: Number(row["Pct_Tecnicas"]),
      num_capacitados_tecnicas: Number(row["Cap_Tecnicas"]),
      pct_habilidades_socioemocionales: Number(row["Pct_Socioemocionales"]),
      num_capacitados_socioemocionales: Number(row["Cap_Socioemocionales"]),
    }));

    const payload = { habilidades: renamed };

    try {
      const res = await api.post("/habilidades", payload);

      if (!res?.insertados) {
        alert("Error al procesar habilidades.");
        return;
      }

      alert("Habilidades actualizadas.");
      onProcessed?.();
      resetInput();

    } catch (err: any) {
      alert("Error D6: " + err.message);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div
      style={{
        marginTop: 20,
        padding: 15,
        border: "1px solid #ddd",
        borderRadius: 5,
        backgroundColor: "rgba(211, 45, 55, 0.08)",
        width: "50%",
        minWidth: 320,
      }}
    >
      <h4 style={{ marginTop: 0, fontWeight: "bold" }}>
        Carga de reporte de Habilidades (Excel o CSV)
      </h4>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
        style={{ marginBottom: 10 }}
      />

      {fileInfo && (
        <div
          style={{
            padding: 10,
            backgroundColor: "#eee",
            borderRadius: 3,
            marginBottom: 10,
          }}
        >
          <strong>Resumen del archivo:</strong>
          <ul>
            <li>Total filas: {fileInfo.length}</li>
            <li>Filas válidas: {validRows.length}</li>
            <li style={{ color: "#D32D37" }}>
              Filas con errores: {invalidRows.length}
            </li>
          </ul>

          {hasValidationIssues && (
            <div style={{ marginTop: 10, color: "#D32D37" }}>
              ⚠️ El archivo tiene filas vacías o no numéricas.
              <br />
              Solo se procesarán las filas válidas si decide continuar.
            </div>
          )}
        </div>
      )}

      {/* Si NO hay errores → botón normal */}
      {validFile && !hasValidationIssues && (
        <button
          onClick={procesar}
          style={{
            width: "100%",
            padding: "10px",
            background: "#D32D37",
            color: "white",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Procesar archivo
        </button>
      )}

      {/* Si SÍ hay errores → 2 botones, el principal es Cargar otro */}
      {validFile && hasValidationIssues && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={resetInput}
            style={{
              width: "100%",
              padding: "10px",
              background: "#D32D37", // botón principal
              color: "white",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cargar otro archivo
          </button>

          <button
            onClick={procesar}
            style={{
              width: "100%",
              padding: "10px",
              background: "#666",
              color: "white",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Actualizar sólo filas válidas
          </button>
        </div>
      )}
    </div>
  );
}
