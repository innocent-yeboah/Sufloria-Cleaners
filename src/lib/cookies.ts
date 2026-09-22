export const COOKIE_CONSENT_KEY = "sufloria_cookie_consent_v1";

export type CookiePreferences = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  decidedAt: string;
};

export const DEFAULT_REJECTED_PREFS: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  decidedAt: "",
};

export function parseCookiePreferences(raw: string | null): CookiePreferences | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<CookiePreferences>;
    if (typeof data.functional !== "boolean" || typeof data.analytics !== "boolean") {
      return null;
    }
    return {
      necessary: true,
      functional: data.functional,
      analytics: data.analytics,
      decidedAt: typeof data.decidedAt === "string" ? data.decidedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
