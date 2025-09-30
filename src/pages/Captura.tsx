import React from "react";
import Header from "../components/Header";
import PageBg from "../components/PageBackground";
import { useAuth } from "../context/AuthContext";

type LinkItem = { label: string; url?: string | null };
type SubSection = { title: string; items: LinkItem[] };
type Section = {
  title: string;
  items?: LinkItem[];
  subsections?: SubSection[];
};

const DATA: Section[] = [
  {
    title: "Satisfacción y Experiencia",
    items: [
      { label: "Encuesta a la Ciudadanía", url: "https://v3.proyectamos-odk.com/-/single/RVEcPrbIemhtXCXyL96ynpfOMs1l7oM?st=pyY4d89!d5HshHLh87!p!gfq4fAhBGloCpb!L0oaitrmlw1aZQdvbKi7dPNtJ3FS" },
      { label: "Grupos Focales (Sistematización)", url: "https://v3.proyectamos-odk.com/-/single/LIGFILsNxKfRcw1qW1kx1wgYTEE8X6i?st=f7m2TQ8jhkBERmHNzCRHpHHNfF4jUYe04Vp2auE4uX9k0cDq9$Np4yzv1rLy$la6" },
    ],
  },
  {
    title: "Prestación del Servicio",
    items: [
      { label: "Calificación de PQRSD", url: "https://v3.proyectamos-odk.com/-/single/wvK5vmKyy0Emb2Cw7qE24PKqF7fb1m8?st=shDv8Tab2VoXIT7y5z8LHCY8yUGXo2X610QkerUzeO7CFHtMhZT19kKOD79ZM2a7"},
      { label: "Calificación de Procesos", url: "https://v3.proyectamos-odk.com/-/single/bhQ2AuXFQTeXrQ1sgM94vpCE5e1uHvz?st=$61rAhag2UElUCaPI5oxWLNh7e8gHc3DDkYXIL7J2jpqUcB$7PAWugGbW!9ESDBD" },
      { label: "Asignación de PQRS", url: "https://modeloserviciociudadania.shinyapps.io/Asignapp/" },
    ],
    subsections: [
      {
        title: "Cliente Oculto",
        items: [
          { label: "Punto CADE", url: "https://v3.proyectamos-odk.com/-/single/djg99nRZHZDH52lSKTmdjH22YdO29z8?st=LDmWHRRU6DCxE$kZ4sO8KS4GSh2eJC$MAyRY58AnZ4RPaaeLc926s6MqGP4S3mg3" },
          { label: "SuperCADE Móvil", url: "https://v3.proyectamos-odk.com/-/single/evPVf9QdlGPX2hLbP9YOSLcrsX0IfHx?st=EXHTW4c1sL6opisWUfRwhGreFJ9UvdZ4NlFDUAalxHufY!oljDKosP6atvrgqEuQ" },
          { label: "Punto propio", url: "https://v3.proyectamos-odk.com/-/single/t3UetmcVefO6iCHq3hadW2QzW6OTLvK?st=AAYBA2rxzKZrY7g!rtxZYFrtV5IIiiHDQovVORTmbBENdiATF73eNP8MrdY$WkUL" },
          { label: "Centros Locales", url: "https://v3.proyectamos-odk.com/-/single/hZBpKfbB4oNdgZ0QWZhX9SgakmtaVIp?st=FTo8UDl93an4nSdno6P!fuN6QymDCd2QJ9ZeDzLs5BCBaG5HKi9C5slYW!McDQ!n" },
          { label: "Alcaldías Locales", url: "https://v3.proyectamos-odk.com/-/single/djg99nRZHZDH52lSKTmdjH22YdO29z8?st=LDmWHRRU6DCxE$kZ4sO8KS4GSh2eJC$MAyRY58AnZ4RPaaeLc926s6MqGP4S3mg3" },
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
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEntidad = user?.role === "entidad";

  // Etiquetas permitidas para ENTIDAD
  const allowedLabels = new Set<string>([
    "Encuesta a la Ciudadanía",
    "Grupos Focales (Sistematización)",
    "Calificación de Procesos",
  ]);

  // Si es ENTIDAD, filtramos DATA para mostrar solo lo permitido
  const filteredData: Section[] = React.useMemo(() => {
    if (isAdmin) return DATA;

    if (isEntidad) {
      return DATA.map((section) => {
        const items = section.items?.filter((it) => allowedLabels.has(it.label)) ?? [];
        // Para ENTIDAD no hay subsecciones permitidas (todas ocultas)
        const subsections: SubSection[] = [];
        // Si una sección queda vacía (sin items ni subsections), la omitimos luego
        return { ...section, items, subsections };
      }).filter(sec => (sec.items && sec.items.length) || (sec.subsections && sec.subsections.length));
    }

    // Si no hay usuario (no debería por ruta protegida) devolvemos vacío
    return [];
  }, [isAdmin, isEntidad]);

  const SECTIONS = isAdmin ? DATA : filteredData;

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
          {SECTIONS.map((section) => (
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
