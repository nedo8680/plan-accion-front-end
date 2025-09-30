export const API_URL = import.meta.env.VITE_API_URL as string;

export async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token"); // 👈 asegúrate que coincide con lib/auth.setToken
  const headers = new Headers(options.headers || {});

  if (token) headers.set("Authorization", `Bearer ${token}`);

  // No pisar Content-Type si body es FormData o URLSearchParams
  const isForm =
    options.body instanceof FormData ||
    options.body instanceof URLSearchParams;
  if (!headers.has("Content-Type") && !isForm) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token inválido o caducado → limpiar y mandar a login
    localStorage.removeItem("token");
    window.location.replace("/login");
    throw new Error("No autorizado");
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
