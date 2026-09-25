"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  COOKIE_CONSENT_KEY,
  DEFAULT_REJECTED_PREFS,
  parseCookiePreferences,
  type CookiePreferences,
} from "@/lib/cookies";

type CookieConsentContextValue = {
  ready: boolean;
  preferences: CookiePreferences | null;
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (prefs: Pick<CookiePreferences, "functional" | "analytics">) => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function persist(prefs: CookiePreferences) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore quota / private mode failures
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const existing = parseCookiePreferences(localStorage.getItem(COOKIE_CONSENT_KEY));
    if (existing) {
      setPreferences(existing);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
    setReady(true);
  }, []);

  const decide = useCallback((prefs: CookiePreferences) => {
    const next = {
      ...prefs,
      decidedAt: new Date().toISOString(),
      necessary: true as const,
    };
    persist(next);
    setPreferences(next);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const acceptAll = useCallback(() => {
    decide({
      necessary: true,
      functional: true,
      analytics: true,
      decidedAt: "",
    });
  }, [decide]);

  const rejectNonEssential = useCallback(() => {
    decide({ ...DEFAULT_REJECTED_PREFS, decidedAt: "" });
  }, [decide]);

  const savePreferences = useCallback(
    (prefs: Pick<CookiePreferences, "functional" | "analytics">) => {
      decide({
        necessary: true,
        functional: prefs.functional,
        analytics: prefs.analytics,
        decidedAt: "",
      });
    },
    [decide]
  );

  const openSettings = useCallback(() => {
    setShowSettings(true);
    setShowBanner(true);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
    if (preferences) setShowBanner(false);
  }, [preferences]);

  const value = useMemo(
    () => ({
      ready,
      preferences,
      showBanner,
      showSettings,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openSettings,
      closeSettings,
    }),
    [
      ready,
      preferences,
      showBanner,
      showSettings,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      openSettings,
      closeSettings,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      <CookieBanner />
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}

function CookieBanner() {
  const {
    showBanner,
    showSettings,
    preferences,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    openSettings,
    closeSettings,
  } = useCookieConsent();

  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFunctional(preferences.functional);
      setAnalytics(preferences.analytics);
    } else if (showSettings) {
      setFunctional(false);
      setAnalytics(false);
    }
  }, [preferences, showSettings]);

  if (!showBanner) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
    >
      <div className="container-site max-w-4xl rounded-2xl border-[3px] border-gold bg-navy p-5 text-cream shadow-soft sm:p-6">
        <h2
          id="cookie-banner-title"
          className="font-heading text-lg font-bold text-gold-light sm:text-xl"
        >
          Cookies on this site
        </h2>
        <p id="cookie-banner-desc" className="mt-2 text-sm leading-relaxed text-cream/85">
          We use strictly necessary cookies to run the site. Optional cookies help
          with things like embedded maps. You can accept all, reject non-essential,
          or choose your preferences. Read our{" "}
          <Link href="/cookies" className="font-semibold text-gold-light hover:underline">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-gold-light hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {showSettings ? (
          <div className="mt-5 space-y-4 rounded-xl bg-light p-4">
            <label className="flex items-start gap-3 text-sm text-dark/80">
              <input type="checkbox" checked disabled className="mt-1" aria-describedby="cookie-necessary-desc" />
              <span>
                <strong className="text-navy">Strictly necessary</strong>
                <span id="cookie-necessary-desc" className="block text-dark/65">
                  Always on — required for security and remembering your cookie choice.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-dark/80">
              <input
                type="checkbox"
                checked={functional}
                onChange={(e) => setFunctional(e.target.checked)}
                className="mt-1 accent-teal"
              />
              <span>
                <strong className="text-navy">Functional</strong>
                <span className="block text-dark/65">
                  Enables third-party embeds such as Google Maps on the contact page.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-dark/80">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 accent-teal"
              />
              <span>
                <strong className="text-navy">Analytics</strong>
                <span className="block text-dark/65">
                  Helps us understand site use (not currently active; reserved for future tools).
                </span>
              </span>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeSettings}
                className="rounded-md border border-navy/15 px-4 py-2.5 text-sm font-bold text-navy transition hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => savePreferences({ functional, analytics })}
                className="btn-navy"
              >
                Save preferences
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={openSettings}
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-gold px-4 py-2.5 text-sm font-bold text-gold-light"
            >
              Manage preferences
            </button>
            <button
              type="button"
              onClick={rejectNonEssential}
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-gold px-4 py-2.5 text-sm font-bold text-gold-light"
            >
              Reject non-essential
            </button>
            <button type="button" onClick={acceptAll} className="btn-primary">
              Accept all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  const { openSettings } = useCookieConsent();
  return (
    <button type="button" onClick={openSettings} className={className}>
      Cookie settings
    </button>
  );
}
