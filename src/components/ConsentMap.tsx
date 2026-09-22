"use client";

import { MapPin } from "lucide-react";
import { useCookieConsent } from "@/components/CookieConsent";
import { SERVICE_AREAS } from "@/lib/constants";

const MAP_EMBED_URL =
  "https://www.google.com/maps?q=Derby%2C%20United%20Kingdom&output=embed";

const MAP_EXTERNAL_URL = "https://www.google.com/maps/place/Derby";

/**
 * Google Maps embed gated behind functional cookie consent (UK PECR).
 */
export default function ConsentMap() {
  const { ready, preferences, openSettings } = useCookieConsent();
  const allowed = Boolean(ready && preferences?.functional);

  return (
    <div className="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-soft">
      <div className="border-b border-navy/8 px-5 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 shrink-0 text-teal" aria-hidden />
          <h3 className="font-heading text-base font-bold text-navy">
            {SERVICE_AREAS.headline}
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-dark/70">
          {SERVICE_AREAS.summary}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SERVICE_AREAS.regions.map((region) => (
            <li
              key={region}
              className="rounded-md bg-light px-2.5 py-1 text-xs font-semibold text-navy"
            >
              {region}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-dark/65">{SERVICE_AREAS.note}</p>
      </div>

      <div className="relative h-64 w-full bg-light">
        {allowed ? (
          <iframe
            title="Map of Derby and surrounding areas — Sufloria service coverage"
            src={MAP_EMBED_URL}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="max-w-sm text-sm leading-relaxed text-dark/70">
              The interactive map uses Google cookies. Enable{" "}
              <strong>functional cookies</strong> to load it here, or open the map
              on Google Maps instead.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={openSettings} className="btn-navy">
                Cookie settings
              </button>
              <a
                href={MAP_EXTERNAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-navy/15 px-6 py-3 text-sm font-bold uppercase tracking-wide text-navy transition hover:bg-white"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
