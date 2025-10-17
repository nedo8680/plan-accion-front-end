import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiSettings, FiMenu, FiX } from "react-icons/fi";

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-4 py-2 text-sm font-medium transition
     focus:outline-none focus:ring-2 focus:ring-yellow-300
     ${isActive ? "bg-yellow-400 text-gray-900" : "text-white hover:text-yellow-200"}`;

  const isAdmin = user?.role === "admin";
  const isEntidad = user?.role === "entidad";
  const isAuditor = user?.role === "auditor";

  const entidadPerm = (user as any)?.entidad_perm as ("captura_reportes" | "reportes_seguimiento" | null | undefined);
  // sin fallback: si es null/undefined, NO mostramos Captura ni Seguimiento por ser indeterminado
  const entidadCapRep = isEntidad && entidadPerm === "captura_reportes";
  const entidadRepSeg = isEntidad && entidadPerm === "reportes_seguimiento";

  // Normaliza email para /auth/me o JWT
  const displayEmail = React.useMemo(() => {
    const u = user as any;
    return u?.email ?? u?.sub ?? "";
  }, [user]);
  const displayRole = user?.role as string | undefined;

  return (
    <header className="sticky top-0 z-50 isolate w-full bg-[#D32D37] shadow-md text-base">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo-blanco-bta.png" alt="Alcaldía Mayor de Bogotá"
                 className="h-9 w-auto object-contain md:h-12" loading="eager" />
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:block" aria-label="Principal">
            <ul className="flex items-center gap-2">
              {/* Captura: admin | entidad(captura_reportes) */}
              {(isAdmin || isAuditor || entidadCapRep) && (
                <li><NavLink to="/captura" className={navLinkClass}>Captura</NavLink></li>
              )}

              {/* Reportes: público y autenticados */}
              <li><NavLink to="/reportes" className={navLinkClass}>Reportes</NavLink></li>

              {/* Seguimiento: admin | auditor | entidad(reportes_seguimiento) */}
              {(isAdmin || isAuditor || entidadRepSeg) && (
                <li><NavLink to="/seguimiento" className={navLinkClass}>Seguimiento</NavLink></li>
              )}
            </ul>
          </nav>

          {/* Sesión (derecha) */}
          <div className="ml-4 flex items-center gap-3 text-white">
            {!user && (
              <Link
                to="/login"
                className="rounded bg-white/20 px-3 py-1 text-sm hover:bg-white/30 focus:outline-none"
              >
                Iniciar sesión
              </Link>
            )}
            {user && (
              <>
                <span className="hidden sm:inline text-sm">
                  {displayEmail} ({ displayRole === "auditor" ? "Evaluador" : displayRole})
                </span>

                {/* Gestión de usuarios (solo admin) */}
                {isAdmin && (
                  <Link
                    to="/admin/usuarios"
                    aria-label="Gestión de usuarios"
                    title="Gestión de usuarios"
                    className="group relative hidden md:inline-flex items-center justify-center rounded bg-white/20 p-2 hover:bg-white/30 focus:outline-none"
                  >
                    <FiSettings size={20} />
                  </Link>
                )}

                {/* Salir en desktop */}
                <button
                  onClick={() => { logout(); navigate("/login", { replace: true }); }}
                  className="hidden md:inline-flex rounded bg-white/20 px-3 py-1 text-sm hover:bg-white/30 focus:outline-none"
                >
                  Salir
                </button>
              </>
            )}
          </div>

          {/* Hamburguesa móvil */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-300 md:hidden"
            aria-controls="main-nav" aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            <span className="sr-only">Abrir menú</span>
            {!open ? <FiMenu size={24} /> : <FiX size={24} />}
          </button>
        </div>
      </div>

      {/* Navegación Mobile */}
      <div id="main-nav" className={`md:hidden transition-[max-height] duration-300 ease-out overflow-hidden ${open ? "max-h-72" : "max-h-0"}`}>
        <nav aria-label="Principal móvil" className="border-t border-white/10 bg-[#D32D37]">
          {/* Bloque usuario en móvil */}
          {user && (
            <div className="flex items-center justify-between px-3 py-3 text-white border-b border-white/10">
              <div>
                <div className="text-sm font-medium">{displayEmail}</div>
                <div className="text-xs opacity-80">{displayRole === "auditor" ? "Evaluador" : displayRole }</div>
              </div>
              {isAdmin && (
                <Link
                  to="/admin/usuarios"
                  aria-label="Gestión de usuarios"
                  title="Gestión de usuarios"
                  className="inline-flex items-center justify-center rounded bg-white/20 p-2 hover:bg-white/30 focus:outline-none"
                >
                  <FiSettings size={20} />
                </Link>
              )}
            </div>
          )}

          <ul className="px-2 py-2">
            {/* Captura: admin | entidad(captura_reportes) */}
            {(isAdmin || entidadCapRep || isAuditor ) && (
              <li><NavLink to="/captura" className={navLinkClass}>Captura</NavLink></li>
            )}

            {/* Reportes */}
            <li><NavLink to="/reportes" className={navLinkClass}>Reportes</NavLink></li>

            {/* Seguimiento: admin | auditor | entidad(reportes_seguimiento) */}
            {(isAdmin || isAuditor || entidadRepSeg) && (
              <li><NavLink to="/seguimiento" className={navLinkClass}>Seguimiento</NavLink></li>
            )}
          </ul>

          {/* Salir en móvil */}
          {user && (
            <div className="border-t border-white/10 px-2 py-2">
              <button
                onClick={() => { setOpen(false); logout(); navigate("/login", { replace: true }); }}
                className="w-full rounded bg-white/20 px-3 py-2 text-sm text-white hover:bg-white/30 focus:outline-none"
              >
                Salir
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
