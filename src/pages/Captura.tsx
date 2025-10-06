import React from "react";
import Header from "../components/Header";
import PageBg from "../components/PageBackground";
import { useAuth } from "../context/AuthContext";
import { FiChevronDown } from "react-icons/fi";

type LinkItem = { label: string; url?: string | null };
type SubSection = { title: string; items: LinkItem[] };
type Group = { title: string; description?: string; subsections: SubSection[] };

type Section = {
  title: string;
  items?: LinkItem[];          // botones directos
  subsections?: SubSection[];  // subsecciones estándar
  groups?: Group[];            // bloques con subsecciones anidadas (acordeón)
};

/* ======================== DATA ======================== */
const DATA: Section[] = [
  {
    title: "Satisfacción y Experiencia",
    groups: [
      {
        title: "Encuesta a la Ciudadanía",
        description: "Selecciona el canal correspondiente. Cada enlace abrirá en una nueva pestaña.",
        subsections: [
          {
            title: "Canal Presencial",
            items: [
              { label: "RED CADE", url: "	https://v3.proyectamos-odk.com/-/single/g4q4G2GvQfA9u27i02As3n7fbK9C2vs?st=cyWSOSyJ8!whbpZgKG6OqowcrBRYFQWpvzR16Dv$QuK5ijWcq!P5P$Y9DLGGFhWC" },
              { label: "Feria a tu servicio", url: "https://v3.proyectamos-odk.com/-/single/UHFIUXLZ0Hanaycmm2eRjAyBdROa9vm?st=C$eJmB6R0hZkIzsuXNX0oB4DplYQar3FiUrunA57oavyIuuUl7eri8pvEvG6KpyD" },
              { label: "Centros de encuentro", url: "https://v3.proyectamos-odk.com/-/single/g4q4G2GvQfA9u27i02As3n7fbK9C2vs?st=wVufmvETMnRWtD94ak6YodB5M2l56r5VjevXISbgCPPsNuJubFbjdxjC9NXe$9Lw" },
              { label: "Punto propio de entidad", url: "https://v3.proyectamos-odk.com/-/single/g4q4G2GvQfA9u27i02As3n7fbK9C2vs?st=ugfioxSO8xRiKisuQPaF$Cr27VvD8rhnM893nfr$3KpoPKgjc4q7yTqplvZLtZ2c" },
              { label: "Alcaldías locales", url: "https://v3.proyectamos-odk.com/-/single/g4q4G2GvQfA9u27i02As3n7fbK9C2vs?st=4p42Y3vY6rtIUl8n6nn3Vl6GM0BVUZ9EA9qOTDeruMwZql!!74Mpz!Z$G9qTWn6Y" },
            ],
          },
          {
            title: "Canal Virtual",
            items: [
              { label: "Chat y Chatico", url: "https://v3.proyectamos-odk.com/-/single/G3udaSJydb8iqNuFdDxQQYQqhJeApbo?st=FHYtDJPlhJYvB7uVqwX5F$9c8xuIoM2lnsfy$XGxnQynoThrg2uzsx2c3n28YU40" },
              { label: "Portales web", url: "https://v3.proyectamos-odk.com/-/single/gc9QnjDOzCNdtoZoN3pth3Q0LHbQK0D?st=M9bTO4zxvHhS$sWLaIVCLujL2tBhlxKFrOcJZAUF0dSaXU3i7Au$fW0ChsjOH1Ja" },
              { label: "Bogotá te escucha", url: "https://v3.proyectamos-odk.com/-/single/ABCcKp4IkG5hNolmMCXcu3RzUs07dL4?st=DxjZSN$W$jYKhf1KcoAisY1GWjbCn18ckyCV4SyHHPpYOxbWVKft$ZPrnCEl8aaN" },
            ],
          },
          {
            title: "Canal Telefónico",
            items: [
              { label: "Líneas telefónicas", url: "https://v3.proyectamos-odk.com/-/single/fAD9vUFVbshDuXwxP6QxeTPA0gAukoi?st=7FvpzT3s4hQJ01Zct1TvhrzB!yARjqDcM$aKAYhmb2Jt0t2uFgMzg3nY$GCmDngL" },
            ],
          },
        ],
      },
    ],
    items: [
      {
        label: "Grupos Focales (Sistematización)",
        url: "https://v3.proyectamos-odk.com/-/single/LIGFILsNxKfRcw1qW1kx1wgYTEE8X6i?st=f7m2TQ8jhkBERmHNzCRHpHHNfF4jUYe04Vp2auE4uX9k0cDq9$Np4yzv1rLy$la6",
      },
    ],
  },
  {
    title: "Prestación del Servicio",
    items: [
      { label: "Calificación de PQRSD", url: "https://v3.proyectamos-odk.com/-/single/wvK5vmKyy0Emb2Cw7qE24PKqF7fb1m8?st=shDv8Tab2VoXIT7y5z8LHCY8yUGXo2X610QkerUzeO7CFHtMhZT19kKOD79ZM2a7" },
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
          { label: "Alcaldías Locales", url: "https://v3.proyectamos-odk.com/-/single/NWtIUXw0oB9NbVekG1HtxKbo5W4GDIc?st=aSAbIFVBrIy2rxNjEX5Qru1Vn!bZQpQpBg2df5Oq!NtERb6H1Qm7!Uj0W$K7699g" },
          { label: "Canal Telefónico", url: "https://v3.proyectamos-odk.com/-/single/xbfS6j2lOVuanj491rZOVZhQMhmlMoh?st=L$5TSsk1LFDzX!DvEmsnGBI0aPk9TJAKJq0rhbUihhbmw7w96EQyyGZLrxn0HloN" },
          { label: "Canal Virtual", url: "https://v3.proyectamos-odk.com/-/single/d6TniNrmYeTbTWj3sMtl5XdkROkkMSv?st=uM3ZbyYEv0LcLEmf3lfRKLXD0m3v2qiJORFhVFV6N2FGmslytEz32owJF3ygkRni" },
        ],
      },
    ],
  },
];

/* ======================== UI Helpers ======================== */
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
      rel="noopener noreferrer"
      className={`${base} border bg-[#D32D37] text-white hover:bg-yellow-400 hover:text-gray-900`}
      title={item.label}
    >
      {item.label}
    </a>
  );
}

function SubSectionBlock({ sub }: { sub: SubSection }) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700">{sub.title}</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sub.items.map((it) => (
          <LinkButton key={it.label} item={it} />
        ))}
      </div>
    </div>
  );
}

// Acordeón accesible con <details>/<summary>
function GroupAccordion({ group }: { group: Group }) {
  const [open, setOpen] = React.useState(false);

  return (
    <details
      className="mt-4 rounded-xl border bg-white/90 shadow-sm open:shadow-md"
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-gray-900
                   [&::-webkit-details-marker]:hidden"
        aria-label={group.title}
      >
        <span>{group.title}</span>

        {/* Icono chevron: rota cuando está abierto */}
        <span
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <FiChevronDown className="h-5 w-5 text-gray-500" />
        </span>

        {/* Texto solo para lectores de pantalla */}
        <span className="sr-only">{open ? "Contraer" : "Expandir"}</span>
      </summary>

      {group.description ? (
        <p className="mt-1 px-4 text-sm text-gray-600">{group.description}</p>
      ) : null}

      <div className="px-4 pb-4">
        {group.subsections.map((sub) => (
          <SubSectionBlock key={sub.title} sub={sub} />
        ))}
      </div>
    </details>
  );
}

/* ======================== PAGE ======================== */
export default function Captura() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEntidad = user?.role === "entidad";
  const isAuditor = user?.role === "auditor";

  const allowedLabels = new Set<string>([
    "Grupos Focales (Sistematización)",
    "Calificación de Procesos",
  ]);

  const filteredData: Section[] = React.useMemo(() => {
    if (isAdmin || isAuditor ) return DATA;

    if (isEntidad) {
      return DATA.map((section) => {
        const items = section.items?.filter((it) => allowedLabels.has(it.label)) ?? [];
        // No filtramos groups para que ENTIDAD vea “Encuesta a la Ciudadanía”
        const groups = section.groups ?? [];
        const subsections: SubSection[] = []; // tal como ya hacías

        return { ...section, items, groups, subsections };
      }).filter(
        (sec) =>
          (sec.items && sec.items.length) ||
          (sec.subsections && sec.subsections.length) ||
          (sec.groups && sec.groups.length)
      );
    }

    return [];
  }, [isAdmin, isEntidad, isAuditor]);

  const SECTIONS = isAdmin || isAuditor ? DATA : filteredData;

  return (
    <PageBg>
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Captura de Información</h1>
        <p className="mt-1 text-sm text-gray-600">
          Selecciona el formulario correspondiente. Los enlaces se abrirán en una nueva pestaña.
        </p>

        <div className="mt-6 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title} className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>

              {/* Botones directos */}
              {section.items?.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((it) => (
                    <LinkButton key={it.label} item={it} />
                  ))}
                </div>
              ) : null}

              {/* Subsecciones estándar */}
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

              {/* NUEVO: Grupos (acordeón) */}
              {section.groups?.map((group) => (
                <GroupAccordion key={group.title} group={group} />
              ))}
            </section>
          ))}
        </div>
      </main>
    </PageBg>
  );
}
