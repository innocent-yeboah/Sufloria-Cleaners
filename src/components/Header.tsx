"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { COMPANY, NAV_LINKS } from "@/lib/constants";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-gold bg-navy text-cream">
      <div className="container-site flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <BrandLogo inverted />
        <nav className="hidden items-center gap-6 text-sm lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-cream/90 transition hover:text-gold-light"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          href={COMPANY.phoneHref}
          className="hidden rounded-full border border-gold px-3 py-1.5 text-sm text-gold-light md:inline-flex"
        >
          {COMPANY.phoneDisplayLocal}
        </a>
        <Link href="/quote" className="btn-primary hidden sm:inline-flex">
          Get a free quote
        </Link>
        <button
          type="button"
          className="rounded-lg border border-gold/40 p-2 text-gold-light lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-gold/30 bg-navy px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-cream"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a href={COMPANY.phoneHref} className="text-gold-light">
              {COMPANY.phoneDisplayLocal}
            </a>
            <Link href="/quote" className="btn-primary" onClick={() => setOpen(false)}>
              Get a free quote
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
