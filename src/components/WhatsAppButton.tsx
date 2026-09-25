"use client";

import { COMPANY } from "@/lib/constants";
import { useCookieConsent } from "@/components/CookieConsent";

export default function WhatsAppButton() {
  const { showBanner } = useCookieConsent();
  const message = encodeURIComponent(
    "Hello Sufloria Cleaners, I would like a free quote for property cleaning in Derby."
  );
  const href = `https://wa.me/${COMPANY.whatsapp}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp us"
      className={`fixed right-5 z-50 inline-flex min-h-11 items-center gap-2 rounded-full border-[3px] border-gold bg-navy px-4 py-2.5 text-sm font-bold text-gold-light shadow-soft transition hover:bg-teal ${
        showBanner ? "bottom-44 sm:bottom-36" : "bottom-5"
      }`}
    >
      WhatsApp us
    </a>
  );
}
