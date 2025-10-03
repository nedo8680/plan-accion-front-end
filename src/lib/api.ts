const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
export const API_URL: string = BASE;

const TIMEOUT_MS = 8000; // 8s por si hay cold start
const RETRIES = 1;       // 1 reintento rápido

// ====== ESTADO GLOBAL DE CONEXIÓN (opcional para banner) ======
export type ApiConnState = "ok" | "reconnecting" | "down" | "auth";
type Listener = (s: ApiConnState, msg?: string) => void;

let _state: ApiConnState = "ok";
let _message: string | undefined;
const _listeners = new Set<Listener>();

function _emit(next: ApiConnState, msg?: string) {
  _state = next;
  _message = msg;
  _listeners.forEach((fn) => fn(_state, _message));
}

export function onApiStateChange(fn: Listener): () => void {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); }; // ← retorna void
}

export function getApiState() {
  return { state: _state, message: _message };
}

// ====== HELPERS ======
function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      const e = Object.assign(new Error("API_TIMEOUT"), { code: "API_TIMEOUT" });
      reject(e);
    }, ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

async function doFetch(url: string, init?: RequestInit) {
  return withTimeout(fetch(url, { ...init, credentials: "omit" }));
}

function buildUrl(path: string): string {
  if (!BASE) throw new Error("Falta VITE_API_URL");

  let raw = String(path || "").trim();
  if (!raw.startsWith("/")) raw = "/" + raw;

  // separa path y querystring
  const [pathname0, search = ""] = raw.split("?");
  let pathname = pathname0.replace(/\/{2,}/g, "/"); // colapsa // -> /

  // SOLO para endpoints de seguimiento, forzar slash final (evita redirects que rompen CORS)
  if (pathname.startsWith("/seguimiento") && !pathname.endsWith("/")) {
    pathname += "/";
  }

  return `${BASE}${pathname}${search ? "?" + search : ""}`;
}

// ====== API PRINCIPAL ======
export async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  if (token) headers.set("Authorization", `Bearer ${token}`);

  // No pisar Content-Type si body es FormData o URLSearchParams
  const isForm =
    options.body instanceof FormData ||
    options.body instanceof URLSearchParams;

  if (!headers.has("Content-Type") && !isForm) {
    headers.set("Content-Type", "application/json");
  }

  const url = buildUrl(path);
  let lastErr: any;

  for (let i = 0; i <= RETRIES; i++) {
    try {
      const res = await doFetch(url, {
        ...options,
        headers,
        mode: "cors",
        // credentials: "include", // si usas cookies entre dominios
      });

      if (res.status === 401 || res.status === 403) {
        // sesión expirada o sin permisos → marcamos "auth" y redirigimos
        _emit("auth", "Tu sesión ha expirado. Inicia sesión nuevamente.");
        localStorage.removeItem("token");
        // Redirección amigable
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
        const msg = await res.text().catch(() => res.statusText);
        const err = new Error(msg || `AUTH ${res.status}`);
        (err as any).code = "AUTH_ERROR";
        throw err;
      }

      if (!res.ok) {
        // 5xx suele ser cold start o error temporal del back
        if (res.status >= 500) {
          // primer fallo: marcamos "reconnecting"
          _emit("reconnecting", "Sesión expirada, inicia sesion nuevamente.");
          throw Object.assign(new Error(`HTTP_${res.status}`), { code: "SERVER_ERROR" });
        }
        const msg = await res.text().catch(() => res.statusText);
        throw new Error(msg || `HTTP ${res.status}`);
      }

      // Éxito → limpiamos estado si venía reconectando/caído
      if (_state !== "ok") _emit("ok");
      if (res.status === 204) return null;

      const ct = res.headers.get("content-type") || "";
      return ct.includes("application/json") ? res.json() : res.text();

    } catch (e: any) {
      lastErr = e;
      const isTimeout = e?.code === "API_TIMEOUT";
      const netLike =
        isTimeout || e?.name === "TypeError" || e?.message?.includes("Failed to fetch");
      const serverLike = e?.code === "SERVER_ERROR";

      if (i < RETRIES && (netLike || serverLike)) {
        // damos 1 segundo para que Cloud Run "despierte"
        _emit("reconnecting", "Sesión expirada, inicia sesion nuevamente.");
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      // sin éxito tras el retry → "down"
      if (netLike || serverLike) {
        _emit("down", "No se pudo conectar con el servidor. Intenta nuevamente.");
      }
      throw e;
    }
  }

  throw lastErr;
}
