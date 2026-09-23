import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import {
  AUDIENCES,
  COMPANY,
  MEDALS,
  SERVICES,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    absolute: "Cleaning Company Derby | Sufloria Cleaners",
  },
  description:
    "Sufloria Cleaners is a trusted cleaning company in Derby, providing commercial cleaning and end of tenancy cleaning. Request your free quote today.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="px-3 py-6 sm:px-6">
      <div className="gold-frame mx-auto max-w-6xl overflow-hidden bg-white">
        <section className="grid items-center gap-8 px-5 py-10 sm:px-10 lg:grid-cols-2">
          <div>
            <div className="mb-4 grid h-24 w-24 place-items-center rounded-full border-4 border-gold bg-navy px-2 text-center text-[0.65rem] font-bold leading-tight text-gold-light">
              Trusted local cleaning experts
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              {COMPANY.name}
            </p>
            <h1 className="heading-xl mt-2">{COMPANY.heroHeadline}</h1>
            <p className="lead mt-3 max-w-xl text-dark/75">{COMPANY.heroSubheadline}</p>
            <p className="section-label mt-3">{COMPANY.uspHeadline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/quote" className="btn-primary">
                Get a free quote
              </Link>
              <Link href="/quote?type=commercial" className="sr-only">
                Request a commercial quote
              </Link>
              <a
                href={`https://wa.me/${COMPANY.whatsapp}`}
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border-[3px] border-gold">
            <Image
              src={SERVICES[0].image}
              alt={SERVICES[0].imageAlt}
              width={900}
              height={700}
              className="h-64 w-full object-cover sm:h-80"
              priority
            />
            <p className="bg-navy px-4 py-2 text-xs font-bold uppercase tracking-wide text-cream">
              Prepared rental interior, Derby
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 px-5 pb-10 sm:grid-cols-3 sm:px-10">
          {MEDALS.map((medal) => (
            <div
              key={medal.label}
              className="mx-auto grid aspect-square w-36 place-items-center rounded-full border-[3px] border-gold bg-white p-4 text-center text-xs font-bold text-navy"
            >
              {medal.label}
            </div>
          ))}
        </div>

        <section className="px-5 pb-12 sm:px-10">
          <Reveal>
            <h2 className="heading-lg">Property cleaning, built around what happens next</h2>
            <p className="mt-3 max-w-3xl text-dark/75">
              From tenant changeovers to new-build handovers, Sufloria Cleaners provides
              professional property cleaning designed around what happens next.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="overflow-hidden rounded-2xl border-[3px] border-gold"
              >
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  width={600}
                  height={400}
                  className="h-36 w-full object-cover"
                  style={
                    service.imagePosition
                      ? { objectPosition: service.imagePosition }
                      : undefined
                  }
                />
                <p className="bg-navy px-3 py-2 text-xs font-bold uppercase tracking-wide text-cream">
                  {service.shortTitle}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 px-5 pb-12 sm:grid-cols-2 sm:px-10">
          <article className="overflow-hidden rounded-2xl border-[3px] border-gold">
            <h3 className="bg-navy px-4 py-3 font-heading text-lg text-gold-light">
              Tenancy turnaround
            </h3>
            <p className="px-4 py-4 text-sm text-dark/75">
              Tenant leaves → end of tenancy → deep clean → carpets and appliances →
              move-in preparation → property ready.
            </p>
          </article>
          <article className="overflow-hidden rounded-2xl border-[3px] border-gold">
            <h3 className="bg-navy px-4 py-3 font-heading text-lg text-gold-light">
              New-build handover
            </h3>
            <p className="px-4 py-4 text-sm text-dark/75">
              Building work finishes → after-builders clean → re-clean → final sparkle →
              handover → show home or sales office.
            </p>
          </article>
        </section>

        <section className="px-5 pb-12 sm:px-10">
          <h2 className="heading-lg">Who we work with</h2>
          <p className="section-label">Let us do the dirty work.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {AUDIENCES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-1 inline-block h-2.5 w-3 rotate-[-45deg] border-b-[3px] border-l-[3px] border-gold" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-5 mb-10 rounded-2xl border-[3px] border-gold bg-navy px-6 py-8 text-cream sm:mx-10">
          <h2 className="font-heading text-2xl text-gold-light sm:text-3xl">
            Looking for a reliable cleaning partner?
          </h2>
          <p className="mt-3 max-w-2xl text-cream/85">
            Speak to Sufloria about one-off jobs, property turnarounds and ongoing
            cleaning contracts.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/quote?type=commercial" className="btn-primary">
              Request a commercial quote
            </Link>
            <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-navy">
              Get a free quote
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
