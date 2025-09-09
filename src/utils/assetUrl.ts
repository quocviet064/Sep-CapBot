import capBotAPI from "@/lib/CapBotApi";

const apiOrigin = (() => {
  try {
    const base = (capBotAPI.defaults.baseURL ?? "").toString();

    return new URL(base, window.location.origin).origin.replace(/\/+$/, "");
  } catch {
    return window.location.origin.replace(/\/+$/, "");
  }
})();

const legacyHosts = new Set<string>(["localhost:7190", "127.0.0.1:7190"]);

export function normalizeAssetUrl(u?: string | null): string {
  if (!u) return "";
  const s = u.trim();
  if (!s) return "";

  if (/^(data:|blob:)/i.test(s)) return s;

  if (s.startsWith("//")) {
    try {
      const abs = new URL(window.location.protocol + s);
      if (legacyHosts.has(abs.host)) {
        const api = new URL(apiOrigin);
        abs.protocol = api.protocol;
        abs.host = api.host;
      }
      return abs.toString();
    } catch {
      //
    }
  }

  if (/^https?:\/\//i.test(s)) {
    try {
      const abs = new URL(s);
      if (legacyHosts.has(abs.host)) {
        const api = new URL(apiOrigin);
        abs.protocol = api.protocol;
        abs.host = api.host;
        return abs.toString();
      }
      return s;
    } catch {
      //
    }
  }

  const path = s.startsWith("/") ? s : "/" + s;
  return apiOrigin + path;
}

export function toRelativeIfMatches(u?: string | null): string {
  if (!u) return "";
  const s = u.trim();
  if (!s) return "";

  try {
    const abs = new URL(s);
    const api = new URL(apiOrigin);
    if (abs.origin === api.origin) {
      return abs.pathname + abs.search + abs.hash;
    }
    return s;
  } catch {
    return s.startsWith("/") ? s : "/" + s;
  }
}
