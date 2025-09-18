import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      await login(email, password);
      nav("/plans");
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
          <FaLock className="text-brand" /> Iniciar sesión
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label>Correo</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@demo.com" />
          </div>
          <div className="space-y-1">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className="btn w-full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <div className="mt-3 text-xs text-gray-500">
          Demo: admin@demo.com / admin123 — usuario@demo.com / usuario123
        </div>
      </div>
    </div>
  );
}
