import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import { FaExternalLinkAlt, FaSearch } from "react-icons/fa";

type FormItem = {
  nombre: string;
  seccion: "Satisfacción y Experiencia" | "Prestación de Servicio" | "Otros instrumentos";
  tipos: { label: "Auto diligenciamiento" | "Dispositivo"; url: string }[];
};

const DATA: FormItem[] = [
  {
    nombre: "Encuesta de Satisfacción (General)",
    seccion: "Satisfacción y Experiencia",

    tipos: [
      { label: "Auto diligenciamiento", url: "https://odk.example.org/form/sat-general?mode=self" },
      { label: "Dispositivo", url: "https://odk.example.org/form/sat-general?mode=device" },
    ],
  },
  {
    nombre: "Experiencia en Trámites Digitales",
    seccion: "Otros instrumentos",
    tipos: [
      { label: "Auto diligenciamiento", url: "https://odk.example.org/form/exp-tramites?mode=self" },
      { label: "Dispositivo", url: "https://odk.example.org/form/exp-tramites?mode=device" },
    ],
  },
  {
    nombre: "Punto de Atención Presencial",
    seccion: "Prestación de Servicio",
    tipos: [
      { label: "Auto diligenciamiento", url: "https://odk.example.org/form/presencial?mode=self" },
      { label: "Dispositivo", url: "https://odk.example.org/form/presencial?mode=device" },
    ],
  },
];

export default function Captura() {
  const [q, setQ] = useState("");
  const [seccion, setSeccion] = useState<"Todas" | FormItem["seccion"]>("Todas");
  const [version, setVersion] = useState<"Todas" | string>("Todas");
  const [tipo, setTipo] = useState<"Todos" | "Auto diligenciamiento" | "Dispositivo">("Todos");


  const rows = useMemo(() => {
    return DATA.filter(d => {
      const matchesQ = q ? (d.nombre.toLowerCase().includes(q.toLowerCase())) : true;
      const matchesSeccion = seccion === "Todas" ? true : d.seccion === seccion;
      const matchesTipo = tipo === "Todos" ? true : d.tipos.some(t => t.label === tipo);
      return matchesQ && matchesSeccion && matchesTipo;
    });
  }, [q, seccion, version, tipo]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-3">
        {/* Sidebar filtros */}
        <aside className="card h-max md:sticky md:top-20">
          <h2 className="mb-3 text-lg font-semibold">Filtros</h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <label>Búsqueda</label>
              <div className="relative">
                <input placeholder="Nombre del formulario..." value={q} onChange={e=>setQ(e.target.value)} />
                <FaSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label>Sección</label>
              <select value={seccion} onChange={e=>setSeccion(e.target.value as any)}>
                <option>Todas</option>
                <option>Satisfacción y Experiencia</option>
                <option>Prestación de Servicio</option>
                <option>Otros instrumentos</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Tabla/lista */}
        <section className="md:col-span-2">
          <div className="card overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="p-2">Nombre del Formulario</th>
                  <th className="p-2">Sección</th>
                  <th className="p-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 font-medium">{d.nombre}</td>
                    <td className="p-2">{d.seccion}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        {d.tipos.map((t, i) => (
                          <a key={i} className="btn-outline" href={t.url} target="_blank" rel="noreferrer">
                            <FaExternalLinkAlt /> {t.label}
                          </a>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={5} className="p-3 text-gray-500">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            * Indicaciones de versión: al actualizar un formulario, incremente el tag y mantenga enlaces anteriores por trazabilidad.
          </p>
        </section>
      </main>
    </div>
  );
}
