const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  if (configuredApiBaseUrl) {
    return stripTrailingSlash(configuredApiBaseUrl);
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname || "127.0.0.1";
    return `http://${host}:8000`;
  }

  return "http://127.0.0.1:8000";
}

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
