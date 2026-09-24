import Link from "next/link";
import BrandTagline from "@/components/BrandTagline";
import { CookieSettingsButton } from "@/components/CookieConsent";
import { COMPANY, LEGAL_LINKS, NAV_LINKS, SERVICES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t-[3px] border-gold bg-[#071f1d] text-cream">
      <div className="container-site grid gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-xl text-gold-light">{COMPANY.name}</p>
          <BrandTagline className="mt-1 block font-script text-2xl leading-snug tracking-wide text-gold" />
          <p className="mt-4 text-sm text-cream/80">
            Derby and surrounding areas
          </p>
          <p className="mt-2 text-sm">
            <a className="hover:text-gold-light" href={COMPANY.phoneHref}>
              {COMPANY.phoneDisplayLocal}
            </a>
            <br />
            <a className="hover:text-gold-light" href={`mailto:${COMPANY.email}`}>
              {COMPANY.email}
            </a>
          </p>
        </div>
        <div>
          <p className="font-heading text-gold-light">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-gold-light">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/quote" className="hover:text-gold-light">
                Get a free quote
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-heading text-gold-light">Services</p>
          <ul className="mt-3 space-y-2 text-sm">
            {SERVICES.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <Link href={`/services/${service.slug}`} className="hover:text-gold-light">
                  {service.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/40 px-4 py-6 text-center text-xs text-cream/70 sm:px-6">
        <p>
          © {new Date().getFullYear()} {COMPANY.legalName.toUpperCase()}.
          Registered in England &amp; Wales.
          {COMPANY.companyNumber ? ` Company No: ${COMPANY.companyNumber}.` : ""}{" "}
          All rights reserved.
        </p>
        <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold-light">
              {link.label}
            </Link>
          ))}
          <CookieSettingsButton className="hover:text-gold-light" />
        </p>
      </div>
    </footer>
  );
}
