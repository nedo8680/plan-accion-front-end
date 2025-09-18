import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserShield, FaUser } from "react-icons/fa";

function RoleBadge({ role }: { role?: "admin" | "usuario" }) {
  if (!role) return null;
  const isAdmin = role === "admin";
  return (
    <span className={`badge ${isAdmin ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
      {isAdmin ? <FaUserShield /> : <FaUser />} {isAdmin ? "Admin" : "Usuario"}
    </span>
  );
}

export default function Header() {
  const { user, logout } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"}`;

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <span className="h-2 w-2 rounded-full bg-brand"></span>
           <img className="w-24" src="/src/assets/images/bogota_logo.png" alt="Bogotá logo"/>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={navLinkClass}>Inicio</NavLink>
          <NavLink to="/captura" className={navLinkClass}>Captura</NavLink>
          <NavLink to="/reportes" className={navLinkClass}>Reportes</NavLink>
          <NavLink to="/plans" className={navLinkClass}>Plan de Acción</NavLink>
        </nav>
        {/* <div className="flex items-center gap-3">
          <RoleBadge role={user?.role as any} />
          <span className="hidden text-sm text-gray-600 sm:inline">{user?.sub}</span>
          <button onClick={logout} className="btn-outline">Salir</button>
        </div> */}
      </div>
    </header>
  );
}
