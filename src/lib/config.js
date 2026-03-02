const browserHostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
const envApiBase = import.meta.env.VITE_API_BASE_URL;
const envAppBase = import.meta.env.VITE_APP_BASE_URL;
const isLocalDev = typeof window !== "undefined" && window.location.port === "5173";

function resolveApiBase() {
  if (envApiBase) return envApiBase;
  if (isLocalDev) return `http://${browserHostname}:8000`;
  // Non-dev fallback: assume same-origin API deployment unless explicitly overridden.
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:8000";
}

// Prefer explicit env configuration; fallback keeps local localhost/127.0.0.1 dev simple.
export const API_BASE = resolveApiBase().replace(/\/$/, "");
export const APP_BASE = (envAppBase || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173")).replace(/\/$/, "");
