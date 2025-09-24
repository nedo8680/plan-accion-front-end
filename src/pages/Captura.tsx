import React from "react";
import Header from "../components/Header";
import PageBg from "../components/PageBackground";

type LinkItem = { label: string; url?: string | null };
type SubSection = { title: string; items: LinkItem[] };
type Section = {
  title: string;
  items?: LinkItem[];
  subsections?: SubSection[];
};

// URLs actuales.
const LINKS = {
  satisfaccion_ciudadania:
    "https://v3.proyectamos-odk.com/-/single/RVEcPrbIemhtXCXyL96ynpfOMs1l7oM?st=pyY4d89!d5HshHLh87!p!gfq4fAhBGloCpb!L0oaitrmlw1aZQdvbKi7dPNtJ3FS",
  calificacion_pqrsd:
    "https://v3.proyectamos-odk.com/-/single/wvK5vmKyy0Emb2Cw7qE24PKqF7fb1m8?st=shDv8Tab2VoXIT7y5z8LHCY8yUGXo2X610QkerUzeO7CFHtMhZT19kKOD79ZM2a7",
  calificacion_procesos:
    "https://v3.proyectamos-odk.com/-/single/bhQ2AuXFQTeXrQ1sgM94vpCE5e1uHvz?st=$61rAhag2UElUCaPI5oxWLNh7e8gHc3DDkYXIL7J2jpqUcB$7PAWugGbW!9ESDBD",
  cliente_oculto_punto_cade:
    "https://v3.proyectamos-odk.com/-/single/djg99nRZHZDH52lSKTmdjH22YdO29z8?st=LDmWHRRU6DCxE$kZ4sO8KS4GSh2eJC$MAyRY58AnZ4RPaaeLc926s6MqGP4S3mg3",
} as const;

const DATA: Section[] = [
  {
    title: "Satisfacción y Experiencia",
    items: [
      { label: "Encuesta a la Ciudadanía", url: LINKS.satisfaccion_ciudadania },
      { label: "Grupos Focales (Sistematización)", url: null },
    ],
  },
  {
    title: "Prestación del Servicio",
    items: [
      { label: "Calificación de PQRSD", url: LINKS.calificacion_pqrsd },
      { label: "Calificación de Procesos", url: LINKS.calificacion_procesos },
      { label: "Asignación de PQRS", url: "https://modeloserviciociudadania.shinyapps.io/Asignapp/" },
    ],
    subsections: [
      {
        title: "Cliente Oculto",
        items: [
          { label: "Punto CADE", url: LINKS.cliente_oculto_punto_cade },
          { label: "SuperCADE Móvil", url: null },
          { label: "Punto propio", url: null },
          { label: "Centros Locales", url: null },
          { label: "Alcaldías Locales", url: null },
          { label: "Canal Telefónico", url: "https://v3.proyectamos-odk.com/-/single/xbfS6j2lOVuanj491rZOVZhQMhmlMoh?st=L$5TSsk1LFDzX!DvEmsnGBI0aPk9TJAKJq0rhbUihhbmw7w96EQyyGZLrxn0HloN" },
          { label: "Canal Virtual", url: "https://v3.proyectamos-odk.com/-/single/d6TniNrmYeTbTWj3sMtl5XdkROkkMSv?st=uM3ZbyYEv0LcLEmf3lfRKLXD0m3v2qiJORFhVFV6N2FGmslytEz32owJF3ygkRni" },
        ],
      },
    ],
  },
];

function LinkButton({ item }: { item: LinkItem }) {
  const base =
    "w-full rounded-md px-4 py-3 text-left text-sm font-medium transition shadow focus:outline-none focus:ring-2 focus:ring-yellow-300";
  if (!item.url) {
    return (
      <button
        type="button"
        className={`${base} cursor-not-allowed border bg-gray-100 text-gray-400`}
        title="Encuesta no disponible por el momento"
        disabled
      >
        {item.label}
      </button>
    );
  }
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className={`${base} border bg-[#D32D37] text-white hover:bg-yellow-400 hover:text-gray-900`}
      title={item.label}
    >
      {item.label}
    </a>
  );
}

export default function Captura() {
  return (
    <PageBg>
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
          Captura de Información
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Selecciona el formulario correspondiente. Los enlaces se abrirán en una nueva pestaña.
        </p>

        <div className="mt-6 space-y-8">
          {DATA.map((section) => (
            <section key={section.title} className="card">
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>

              {/* Ítems directos de la sección */}
              {section.items?.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((it) => (
                    <LinkButton key={it.label} item={it} />
                  ))}
                </div>
              ) : null}

              {/* Subsecciones (como Cliente Oculto) */}
              {section.subsections?.map((sub) => (
                <div key={sub.title} className="mt-6">
                  <h3 className="text-base font-semibold text-gray-700">{sub.title}</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sub.items.map((it) => (
                      <LinkButton key={it.label} item={it} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </main>
    </PageBg>
  );
}
