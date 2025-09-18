import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import { FaExternalLinkAlt, FaDownload } from "react-icons/fa";

const ENTIDADES = ["Todas", "Secretaría de Salud", "Secretaría de Educación", "Catastro"];
const PILARES = ["Todos", "Satisfacción", "Experiencia", "Servicio", "Cobertura"];
const INDICADORES = ["Todos", "NPS", "CSAT", "Tiempo de Atención", "Resolutividad"];
const FORMATOS = ["Tabla", "Gráfico", "Serie Temporal"];
const SHINY_BASE_URL = "https://shiny.example.org/app";
const SHINY_EXPORTS = ["CSV", "XLSX", "PNG", "PDF"];

function buildUrl({ entidad, pilar, indicador, formato }: { entidad: string; pilar: string; indicador: string; formato: string; }) {
  const params = new URLSearchParams({
    entidad: entidad === "Todas" ? "" : entidad,
    pilar: pilar === "Todos" ? "" : pilar,
    indicador: indicador === "Todos" ? "" : indicador,
    formato
  });
  return `${SHINY_BASE_URL}?${params.toString()}`;
}

export default function Reportes() {
  const [entidad, setEntidad] = useState(ENTIDADES[0]);
  const [pilar, setPilar] = useState(PILARES[0]);
  const [indicador, setIndicador] = useState(INDICADORES[0]);
  const [formato, setFormato] = useState(FORMATOS[0]);
  const [embed, setEmbed] = useState(true);

  const targetUrl = useMemo(() => buildUrl({ entidad, pilar, indicador, formato }), [entidad, pilar, indicador, formato]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-3">
        {/* Sidebar filtros */}
        <aside className="card h-max md:sticky md:top-20">
          <h2 className="mb-3 text-lg font-semibold">Filtros</h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <label>Entidad</label>
              <select value={entidad} onChange={e=>setEntidad(e.target.value)}>
                {ENTIDADES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label>Pilar</label>
              <select value={pilar} onChange={e=>setPilar(e.target.value)}>
                {PILARES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label>Indicador</label>
              <select value={indicador} onChange={e=>setIndicador(e.target.value)}>
                {INDICADORES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label>Formato</label>
              <select value={formato} onChange={e=>setFormato(e.target.value)}>
                {FORMATOS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-gray-700">Ver embebido</span>
              <label className="inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" checked={embed} onChange={e=>setEmbed(e.target.checked)} />
                <span className="h-6 w-11 rounded-full bg-gray-200 after:ml-0.5 after:mt-0.5 after:block after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-brand peer-checked:after:translate-x-5"></span>
              </label>
            </div>

            <div className="flex gap-2">
              <a className="btn flex-1" href={targetUrl} target="_blank" rel="noreferrer">
                <FaExternalLinkAlt /> Abrir en Shiny
              </a>
            </div>

            <div className="pt-2">
              <div className="text-xs text-gray-500">Métodos de exporte soportados:</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {SHINY_EXPORTS.map(m => (
                  <span key={m} className="badge"><FaDownload /> {m}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido */}
        <section className="md:col-span-2">
          <div className="card">
            <div className="mb-2 break-all rounded-md bg-gray-50 p-2 text-xs">{targetUrl}</div>
            {embed ? (
              <div className="overflow-hidden rounded-lg border">
                <iframe title="Shiny Report" src={targetUrl} className="h-[560px] w-full"></iframe>
              </div>
            ) : (
              <div className="text-sm text-gray-600">La vista embebida está desactivada. Usa “Abrir en Shiny”.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
