import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-yellow-400 text-gray-900" : "text-white hover:text-yellow-400"}`;

  return (
    <header className="sticky top-0 z-10 border-b bg-[#D32D37] backdrop-blur shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/logo-blanco-bta.png"
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/captura" className={navLinkClass}>Captura</NavLink>
          <NavLink to="/reportes" className={navLinkClass}>Reportes</NavLink>
          <NavLink to="/seguimiento" className={navLinkClass}>Seguimiento</NavLink>
        </nav>
      </div>
    </header>
  );
}
