import type { Metadata } from "next";
import Link from "next/link";
import { AUDIENCES, COMPANY, MEDALS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sufloria Cleaners is a Derby-based property cleaning specialist helping agents, landlords, developers, businesses and homeowners prepare properties for what happens next.",
};

export default function AboutPage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-4xl">
        <p className="section-label">{COMPANY.tagline}</p>
        <h1 className="heading-xl">{COMPANY.uspHeadline}</h1>
        <div className="gold-frame mt-8 space-y-5 bg-white p-6 sm:p-10">
          <p>
            At Sufloria Cleaners, professional cleaning is about more than making a
            property look clean. It is about creating a space that feels fresh, hygienic,
            cared for and ready for what comes next.
          </p>
          <p>
            Based in Derby, we provide professional property cleaning to letting agents,
            landlords, property managers, developers, businesses, Airbnb hosts, tenants
            and homeowners across Derby and surrounding areas.
          </p>
          <p>
            Our focus is where reliability and attention to detail matter most — from
            preparing a rental for its next tenant to getting a newly built or renovated
            property ready for handover.
          </p>
          <p>
            One cleaning partner. Multiple property needs. One higher standard.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {MEDALS.map((medal) => (
            <div
              key={medal.label}
              className="grid min-h-36 place-items-center rounded-full border-[3px] border-gold bg-white p-6 text-center text-sm font-bold text-navy"
            >
              {medal.label}
            </div>
          ))}
        </div>
        <h2 className="heading-lg mt-12">Who we work with</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {AUDIENCES.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-1 inline-block h-2.5 w-3 rotate-[-45deg] border-b-[3px] border-l-[3px] border-gold" />
              {item}
            </li>
          ))}
        </ul>
        <Link href="/quote" className="btn-primary mt-8">
          Get a free quote
        </Link>
      </div>
    </div>
  );
}
