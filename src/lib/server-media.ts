const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function cleanPath(input?: string | null): string {
  if (!input) return "";
  const value = String(input).trim().replace(/^['"]+|['"]+$/g, "");
  if (!value || value === "null" || value === "undefined") return "";
  return value;
}

export function resolveServerMedia(path?: string | null): string {
  const value = cleanPath(path);
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/assets/") || value.startsWith("/img/") || value.startsWith("/placeholder/")) return value;

  const normalized = value.startsWith("/") ? value : `/${value}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}

export function buildUploadThumbPath(path?: string | null): string {
  const value = cleanPath(path);
  if (!value) return "";
  if (value.includes("/thumbs/")) return value;
  if (!value.includes("uploads/")) return value;

  const normalized = value.startsWith("/") ? value : `/${value}`;
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash === -1) return normalized;

  return `${normalized.slice(0, lastSlash)}/thumbs${normalized.slice(lastSlash)}`;
}

export function resolveServerMediaThumb(path?: string | null): string {
  return resolveServerMedia(path);
}
