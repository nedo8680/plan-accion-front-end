import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-4 py-2 text-sm font-medium transition
     focus:outline-none focus:ring-2 focus:ring-yellow-300
     ${isActive ? "bg-yellow-400 text-gray-900" : "text-white hover:text-yellow-200"}`;

  const isAdmin = user?.role === "admin";
  const isEntidad = user?.role === "entidad";

  return (
    <header className="sticky top-0 z-50 isolate w-full bg-[#D32D37] shadow-md text-base">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo-blanco-bta.png" alt="Alcaldía Mayor de Bogotá"
                 className="h-9 w-auto object-contain md:h-12" loading="eager" />
          </Link>

          {/* Navegación Desktop: 1) Captura 2) Reportes 3) Seguimiento */}
          <nav className="hidden md:block" aria-label="Principal">
            <ul className="flex items-center gap-2">
              {(isAdmin || isEntidad) && (
                <>
                  <li><NavLink to="/captura" className={navLinkClass}>Captura</NavLink></li>
                  <li><NavLink to="/reportes" className={navLinkClass}>Reportes</NavLink></li>
                  <li><NavLink to="/seguimiento" className={navLinkClass}>Seguimiento</NavLink></li>
                </>
              )}
            </ul>
          </nav>

          {/* Usuario + salir */}
          {user && (
            <div className="ml-4 flex items-center gap-3 text-white">
              <span className="hidden sm:inline text-sm">
                {user.email} ({user.role})
              </span>
              <button
                onClick={() => { logout(); window.location.assign("/"); }}
                className="rounded bg-white/20 px-3 py-1 text-sm hover:bg-white/30 focus:outline-none"
              >
                Salir
              </button>
            </div>
          )}

          {/* Hamburguesa móvil */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg白/10 focus:outline-none focus:ring-2 focus:ring-yellow-300 md:hidden"
            aria-controls="main-nav" aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            <span className="sr-only">Abrir menú</span>
            <svg className={`h-6 w-6 ${open ? "hidden" : "block"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg className={`h-6 w-6 ${open ? "block" : "hidden"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navegación Mobile */}
      <div id="main-nav" className={`md:hidden transition-[max-height] duration-300 ease-out overflow-hidden ${open ? "max-h-64" : "max-h-0"}`}>
        <nav aria-label="Principal móvil" className="border-t border-white/10 bg-[#D32D37]">
          <ul className="px-2 py-2">
            {(isAdmin || isEntidad) && (
              <>
                <li><NavLink to="/captura" className={navLinkClass}>Captura</NavLink></li>
                <li><NavLink to="/reportes" className={navLinkClass}>Reportes</NavLink></li>
                <li><NavLink to="/seguimiento" className={navLinkClass}>Seguimiento</NavLink></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
