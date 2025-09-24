import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import ResponsiveIframe from "../components/ResponsiveIframe";

/** Secciones y un solo enlace ODK por sección */
type Seccion =
  | "Cliente oculto presencial Punto CADE"
  | "Calificación de procesos"
  | "Formulario de Calificación de PQRSD"
  | "Formulario de Calificación de Procesos"
  | "Formularios de Cliente Oculto"
  | "Satisfacción y experiencia de la ciudadanía";

const ODK_LINKS: Record<Seccion, string | null> = {
  "Cliente oculto presencial Punto CADE": "https://v3.proyectamos-odk.com/-/single/djg99nRZHZDH52lSKTmdjH22YdO29z8?st=LDmWHRRU6DCxE$kZ4sO8KS4GSh2eJC$MAyRY58AnZ4RPaaeLc926s6MqGP4S3mg3", 
  "Calificación de procesos": "https://v3.proyectamos-odk.com/-/single/bhQ2AuXFQTeXrQ1sgM94vpCE5e1uHvz?st=$61rAhag2UElUCaPI5oxWLNh7e8gHc3DDkYXIL7J2jpqUcB$7PAWugGbW!9ESDBD",
  "Formulario de Calificación de PQRSD":
    "https://v3.proyectamos-odk.com/-/single/wvK5vmKyy0Emb2Cw7qE24PKqF7fb1m8?st=shDv8Tab2VoXIT7y5z8LHCY8yUGXo2X610QkerUzeO7CFHtMhZT19kKOD79ZM2a7",
  "Formulario de Calificación de Procesos": null, // TODO
  "Formularios de Cliente Oculto": null, // TODO,
  "Satisfacción y experiencia de la ciudadanía": "https://v3.proyectamos-odk.com/-/single/RVEcPrbIemhtXCXyL96ynpfOMs1l7oM?st=pyY4d89!d5HshHLh87!p!gfq4fAhBGloCpb!L0oaitrmlw1aZQdvbKi7dPNtJ3FS"
};

const SECCIONES = Object.keys(ODK_LINKS) as Seccion[];

export default function Captura() {
  const [active, setActive] = useState<Seccion>("Formulario de Calificación de PQRSD");

  const currentUrl = useMemo(() => ODK_LINKS[active], [active]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-3">
        {/* Sidebar con secciones */}
        <aside className="card h-max md:sticky md:top-20">
          <h2 className="mb-3 text-lg font-semibold">Secciones</h2>
          <div className="flex flex-col gap-2">
            {SECCIONES.map((s) => {
              const hasUrl = !!ODK_LINKS[s];
              return (
                <button
                  key={s}
                  onClick={() => hasUrl && setActive(s)}
                  className={`w-full justify-start rounded-md border px-3 py-2 text-left text-sm transition ${
                    active === s ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"
                  } ${!hasUrl ? "opacity-60 cursor-not-allowed" : ""}`}
                  title={hasUrl ? s : "Pendiente de enlace"}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Vista embebida */}
        <section className="md:col-span-2">
          <div className="card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h1 className="text-xl font-semibold">Captura · {active}</h1>
              {currentUrl && (
                <a href={currentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                  Abrir en pestaña nueva
                </a>
              )}
            </div>

            {!currentUrl ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
                Esta sección aún no tiene enlace ODK configurado.
              </div>
            ) : (
              <ResponsiveIframe
                src={currentUrl}
                title={`ODK · ${active}`}
                minHeight={760}
                allow="clipboard-write; fullscreen"
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
