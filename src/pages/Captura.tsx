import React from "react";
import Header from "../components/Header";
import PageBg from "../components/PageBackground";
import { useAuth } from "../context/AuthContext";
import { FiChevronDown } from "react-icons/fi";

type LinkItem = { label: string; url?: string | null };
type SubSection = { title: string; items: LinkItem[], subsections?: SubSection[] };
type Group = { title: string; description?: string; subsections: SubSection[], items?: LinkItem[] };

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
        description: "",
        subsections: [
          {
            title: "",
            items: [
              { label: "Canal Presencial", url: "https://lively-begonia-ccf65e.netlify.app/external/presencial.html" },
            ],
          },
          {
            title: "Canal Virtual",
            items: [
              { label: "Chat", url: "https://lively-begonia-ccf65e.netlify.app/external/chat.html" },
              { label: "Chatico", url: "https://v3.proyectamos-odk.com/-/single/1UaQGsPPboVIARqE1DqJdoTyJDVN2Yz?st=6XwDkP3toPy1uO8gyPaPTUCr$k19hbRyDGT2hzTik2zbF62Uhuszq1gudKqBrSU4&d[/data/mod1/gp0/p0]=2&d[/data/mod1/gp0/p00]=10&d[/data/mod1/gp1/p3]=&d[/data/mod1/gp1/p4]=&d[/data/mod1/gp1/p01]=&d[/data/mod1/gp1/c5]=" },
              { label: "Portales web", url: "https://lively-begonia-ccf65e.netlify.app/external/portal-web-entidad.html" },
              { label: "Bogotá te escucha", url: "https://v3.proyectamos-odk.com/-/single/1UaQGsPPboVIARqE1DqJdoTyJDVN2Yz?st=6XwDkP3toPy1uO8gyPaPTUCr$k19hbRyDGT2hzTik2zbF62Uhuszq1gudKqBrSU4&d[/data/mod1/gp0/p0]=2&d[/data/mod1/gp0/p00]=9&d[/data/mod1/gp1/p3]=&d[/data/mod1/gp1/p4]=&d[/data/mod1/gp1/p01]=&d[/data/mod1/gp1/c5]=" },
            ],
          },
          {
            title: "Canal Telefónico",
            items: [
              { label: "Líneas telefónicas", url: "https://v3.proyectamos-odk.com/-/single/q9WhmBpv8Fj08a6JvImiA82RsLP1XH0?st=!OhjspL68zsDiNveCS!AurvRcLe1TTVwRIhS3VQzLQvckRfBtIfygfDgsif5gF5Z&d[/data/mod1/gp0/p0]=3&d[/data/mod1/gp0/p00]=8&d[/data/mod1/gp1/p3]=&d[/data/mod1/gp1/p4]=&d[/data/mod1/gp1/p01]=&d[/data/mod1/gp1/c5]=" },
            ],
          },
        ],
      },
    ],
    items: [],
  },
  {
    title: "Prestación del Servicio",
    items: [
      { label: "Calificación de PQRSD", url: "https://v3.proyectamos-odk.com/-/wvK5vmKyy0Emb2Cw7qE24PKqF7fb1m8?st=shDv8Tab2VoXIT7y5z8LHCY8yUGXo2X610QkerUzeO7CFHtMhZT19kKOD79ZM2a7" },
      { label: "Calificación de Procesos", url: "https://v3.proyectamos-odk.com/-/ra1YVOFwob1cKdT9MEKym2TGL07D8l7?st=Mns9zPLD7nxnv95FozmNc9ZDkY9xrEin4aiXJBmD3ib8Ct3KLRq0sNeWUmtfBYVz" },
      { label: "Capacidad instalada", url: "https://v3.proyectamos-odk.com/-/kfGUXkKFWCvKL0x0uekN7hdfen98YYP?st=rkJpo9UkDVoyeTnDa3!61w$hzM85khM3aKqbudECZ8HICdiU1kKuIC7eHtG!xXVI&d[/data/mod1/gp1/p0]=1" },
    ],
    subsections: [
      {
        title: "Cliente Oculto",
        items: [
          { label: "Canal Presencial", url: "https://v3.proyectamos-odk.com/-/gPbnWiNfqnEDtYuQCHWrUd04YMZ73ZE?st=$D!33THY4S6e9$KrK!AbR6kXSx9XlbC57cxYt!b9TRTdTi1zyZLq8MreQKosHQtV&d[/data/mod1/gp1/p0]=1" },
          { label: "Canal Virtual", url: "https://v3.proyectamos-odk.com/-/cinQZGeLvAcpjbWYSiPK0cmTcc1SkP6?st=2wtC932SOJNSl8iONeNSNgG74ZhQi!mVKtY5tMdGjXtwLcyt0tl76BzsUMWZtXZI&d[/data/mod1/gp1/p0]=2" },
          { label: "Canal Telefónico", url: "https://v3.proyectamos-odk.com/-/QIo14qfC2tpHxrok6T87RpDabnJUrPu?st=c4n23qFAN1jiMMAZl8ow6gljqc1YDgeiW!Lf02TlUtGb5qgrTx0PUQNpc9K!gEIt&d[/data/mod1/gp1/p0]=3" },
        ],
      },
    ],
  },
];

/* ======================== UI Helpers ======================== */
function LinkButton({ item, onPqrChange, pqrFuncionarioId, pqrPassword }: { item: LinkItem; onPqrChange?: (id: number | null, password: string) => void; pqrFuncionarioId?: number | null; pqrPassword?: string | null }) {
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
  // special case: Calificación de PQRSD -> render the control for PQRSD (select + password)
  if (item.label === "Calificación de PQRSD") {
    return <PqrControl item={item} onPqrChange={onPqrChange} pqrFuncionarioId={pqrFuncionarioId} pqrPassword={pqrPassword} />;
  }

  return (
    <div className="relative flex flex-col min-h-[168px]">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} border bg-[#D32D37] text-white hover:bg-yellow-400 hover:text-gray-900`}
        title={item.label}
      >
        {item.label}
      </a>
    </div>
  );
}

function SubSectionBlock({ sub, onPqrChange, pqrFuncionarioId, pqrPassword }: { sub: SubSection; onPqrChange?: (id: number | null, password: string) => void; pqrFuncionarioId?: number | null; pqrPassword?: string | null }) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700">{sub.title}</h4>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sub.items.map((it) => (
          <LinkButton key={it.label} item={it} onPqrChange={onPqrChange} pqrFuncionarioId={pqrFuncionarioId} pqrPassword={pqrPassword} />
        ))}
      </div>
    </div>
  );
}

function PqrControl({ item, onPqrChange, pqrFuncionarioId, pqrPassword }: { item: LinkItem; onPqrChange?: (id: number | null, password: string) => void; pqrFuncionarioId?: number | null; pqrPassword?: string | null }) {
  const base =
    "w-full rounded-md px-4 py-3 text-left text-sm font-medium transition shadow focus:outline-none focus:ring-2 focus:ring-yellow-300";

  const [open, setOpen] = React.useState(false);
  const [funcionarioId, setFuncionarioId] = React.useState<number | null>(pqrFuncionarioId ?? 1);
  const [password, setPassword] = React.useState<string>(pqrPassword ?? "");

  React.useEffect(() => {
    if (typeof pqrFuncionarioId !== "undefined") setFuncionarioId(pqrFuncionarioId ?? null);
    if (typeof pqrPassword !== "undefined") setPassword(pqrPassword ?? "");
  }, [pqrFuncionarioId, pqrPassword]);

  const buildUrl = () => {
    const id = funcionarioId ?? "";
    const pwd = password ?? "";
    return `${item.url}&d[/data/mod1/gv4/v4]=${encodeURIComponent(String(id))}&d[/data/mod1/gv4/v4.1]=${encodeURIComponent(String(pwd))}`;
  };

  return (
    <div className="relative flex flex-col min-h-[168px]">
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`${base} border bg-[#D32D37] text-white hover:bg-yellow-400 hover:text-gray-900`}
        >
          {item.label}
        </button>
      </div>

      <div className={`${open ? "visible" : "invisible pointer-events-none"} mt-auto rounded-md border bg-gray-50 p-3 shadow-sm`}>
        <label className="block text-sm font-medium text-gray-700">Funcionario</label>
        <select
          aria-label="Funcionario"
          value={funcionarioId ?? undefined}
          onChange={(e) => {
            const id = Number(e.target.value) || null;
            setFuncionarioId(id);
            onPqrChange?.(id, password);
          }}
          className="mt-1 w-full rounded-md border px-2 py-2 text-sm"
        >
          <option value={1}>Jairo Rico</option>
          <option value={2}>Sandra Avila</option>
          <option value={3}>Andrés Villamil</option>
        </select>

        <label className="mt-3 block text-sm font-medium text-gray-700">Contraseña (numérica)</label>
        <input
          type="number"
          aria-label="Contraseña"
          value={password}
          onChange={(e) => {
            const val = e.target.value;
            setPassword(val);
            onPqrChange?.(funcionarioId, val);
          }}
          className="mt-1 w-full rounded-md border px-2 py-2 text-sm"
          placeholder="12345"
        />

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className={`inline-flex items-center rounded-md border bg-[#D32D37] px-3 py-2 text-sm font-medium text-white hover:bg-yellow-400 hover:text-gray-900 ${!password || !funcionarioId ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => {
              const url = buildUrl();
              const popup = window.open(url, "pqrPopup", "width=1024,height=800,scrollbars=yes,resizable=yes");
              if (popup) popup.focus();
              console.log("PQRSD popup open: funcionarioId=", funcionarioId, "password=", password, "url=", url);
            }}
            title="Abrir Encuestas"
          >
            Abrir Encuestas
          </button>

          <button
            type="button"
            className="inline-flex items-center rounded-md border bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// Acordeón accesible con <details>/<summary>
function GroupAccordion({ group, onPqrChange, pqrFuncionarioId, pqrPassword }: { group: Group; onPqrChange?: (id: number | null, password: string) => void; pqrFuncionarioId?: number | null; pqrPassword?: string | null }) {
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
        <span
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <FiChevronDown className="h-5 w-5 text-gray-500" />
        </span>
        <span className="sr-only">{open ? "Contraer" : "Expandir"}</span>
      </summary>

      {group.description ? (
        <p className="mt-1 px-4 text-sm text-gray-600">{group.description}</p>
      ) : null}

      {/* 👇 si el grupo tiene items directos, que los pinte igual que los demás */}
      {group.items?.length ? (
        <div className="mt-3 px-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.items.map((it) => (
            <LinkButton key={it.label} item={it} onPqrChange={onPqrChange} pqrFuncionarioId={pqrFuncionarioId} pqrPassword={pqrPassword} />
          ))}
        </div>
      ) : null}

      <div className="px-4 pb-4">
        {group.subsections.map((sub) => (
          <SubSectionBlock key={sub.title} sub={sub} onPqrChange={onPqrChange} pqrFuncionarioId={pqrFuncionarioId} pqrPassword={pqrPassword} />
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
  const perm = (user as any)?.entidad_perm as "captura_reportes" | "reportes_seguimiento" | null | undefined;

  const allowedLabels = new Set<string>([
    "Grupos Focales (Sistematización)",
    "Calificación de Procesos",
  ]);

  const filteredData: Section[] = React.useMemo(() => {
    if (isAdmin || isAuditor ) return DATA;

    if (isEntidad) {
      // Rol: Seguimiento + Reportes -> puede ver Captura, pero solo ciertas secciones
      if (perm === "reportes_seguimiento") {
        const keepPrestacion = new Set(["Calificación de Procesos", "Capacidad instalada"]);
        return DATA.map((section) => {
          if (section.title === "Satisfacción y Experiencia") {
            return section; // se muestra completa
          }
          if (section.title === "Prestación del Servicio") {
            const items = (section.items ?? []).filter((it) => keepPrestacion.has(it.label));
            return { ...section, items, subsections: [], groups: [] };
          }
          return null;
        })
          .filter((sec): sec is Section => !!sec)
          .filter(
            (sec) =>
              (sec.items && sec.items.length) ||
              (sec.subsections && sec.subsections.length) ||
              (sec.groups && sec.groups.length)
          );
      }

      // Resto de entidades: misma restricción anterior
      return DATA.map((section) => {
        const items = section.items?.filter((it) => allowedLabels.has(it.label)) ?? [];
        const groups = section.groups ?? [];
        const subsections: SubSection[] = [];

        return { ...section, items, groups, subsections };
      }).filter(
        (sec) =>
          (sec.items && sec.items.length) ||
          (sec.subsections && sec.subsections.length) ||
          (sec.groups && sec.groups.length)
      );
    }

    return [];
  }, [isAdmin, isEntidad, isAuditor, perm]);

  const SECTIONS = isAdmin || isAuditor ? DATA : filteredData;

  // PQRSD selection state: store selected funcionario id and password
  const [pqrFuncionarioId, setPqrFuncionarioId] = React.useState<number | null>(1);
  const [pqrPassword, setPqrPassword] = React.useState<string>("");

  const handlePqrChange = (id: number | null, password: string) => {
    setPqrFuncionarioId(id);
    setPqrPassword(password);
  };

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
                    <LinkButton key={it.label} item={it} onPqrChange={handlePqrChange} pqrFuncionarioId={pqrFuncionarioId} pqrPassword={pqrPassword} />
                  ))}
                </div>
              ) : null}

              {/* Subsecciones estándar */}
              {section.subsections?.map((sub) => (
                <div key={sub.title} className="mt-6">
                  <h3 className="text-base font-semibold text-gray-700">{sub.title}</h3>

                  {/* botones directos de la subsección (p. ej. "Cliente Oculto") */}
                  {sub.items?.length ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {sub.items.map((it) => (
                        <LinkButton key={it.label} item={it} onPqrChange={handlePqrChange} pqrFuncionarioId={pqrFuncionarioId} pqrPassword={pqrPassword} />
                      ))}
                    </div>
                  ) : null}

                  {/* 👇 subsecciones internas (p. ej. "Sistematización Cliente Oculto") como acordeón */}
                  {sub.subsections?.map((nested) => (
                    <GroupAccordion
                      key={nested.title}
                      group={{
                        title: nested.title,
                        description: undefined,
                        subsections: nested.subsections ?? [],
                        items: nested.items ?? [],
                      }}
                      onPqrChange={handlePqrChange}
                      pqrFuncionarioId={pqrFuncionarioId}
                      pqrPassword={pqrPassword}
                    />
                  ))}
                </div>
              ))}

              {/* NUEVO: Grupos (acordeón) */}
              {section.groups?.map((group) => (
                <GroupAccordion key={group.title} group={group} onPqrChange={handlePqrChange} pqrFuncionarioId={pqrFuncionarioId} pqrPassword={pqrPassword} />
              ))}
            </section>
          ))}
        </div>
      </main>
    </PageBg>
  );
}
