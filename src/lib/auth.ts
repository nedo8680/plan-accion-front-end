import { jwtDecode } from "jwt-decode";

export type Decoded = { sub: string; role: "admin" | "entidad" | "auditor"; uid: number; exp: number };

export function setToken(token: string) {
  localStorage.setItem("token", token);
}
export function getToken() { return localStorage.getItem("token"); }
export function logout() { localStorage.removeItem("token"); }
export function getUser(): Decoded | null {
  const t = getToken();
  if (!t) return null;
  try { return jwtDecode<Decoded>(t); } catch { return null; }
}
export function isAdmin() { return getUser()?.role === "admin"; }
