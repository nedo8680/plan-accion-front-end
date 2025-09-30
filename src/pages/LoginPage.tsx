import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { getUser } from "../lib/auth"; // 👈 para leer rol inmediatamente tras login

export default function LoginPage() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Si ya está logeado y visita /login, redirige según rol
  useEffect(() => {
    if (user) {
      const dest = user.role === "admin" ? "/captura" : "/seguimiento";
      nav(dest, { replace: true });
    }
  }, [user, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await login(email, password);
      // ⚡️ Inmediatamente después de login, lee el rol desde el token
      nav("/captura", { replace: true });
    } catch (e: any) {
      setErr(e.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="card w-full max-w-sm">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <FaLock className="text-[#D32D37]" /> Iniciar sesión
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label>Correo</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@demo.com"
            />
          </div>
          <div className="space-y-1">
            <label>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="w-full bg-[#D32D37] text-white hover:bg-yellow-400 hover:text-gray-900" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-3 text-xs text-gray-500">
          Demo: admin@demo.com / admin123 — usuario@demo.com / usuario123
        </div>
      </div>
    </div>
  );
}
