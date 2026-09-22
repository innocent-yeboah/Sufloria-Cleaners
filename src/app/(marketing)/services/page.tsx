import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Property Cleaning Services in Derby",
  description:
    "End of tenancy, after-builders, commercial, Airbnb, carpet, oven and specialist cleaning from Sufloria Cleaners in Derby. Request a free quote.",
};

export default function ServicesPage() {
  return (
    <div className="section-padding">
      <div className="container-site">
        <p className="section-label">Derby and surrounding areas</p>
        <h1 className="heading-xl">Property cleaning services</h1>
        <p className="mt-4 max-w-3xl text-dark/75">
          One cleaning partner for tenant changeovers, new-build handovers, workplaces and
          homes. Every job is quoted to the property.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="overflow-hidden rounded-2xl border-[3px] border-gold bg-white"
            >
              <Image
                src={service.image}
                alt={service.imageAlt}
                width={800}
                height={520}
                className="h-44 w-full object-cover"
              />
              <div className="bg-navy px-4 py-2 text-xs font-bold uppercase tracking-wide text-cream">
                {service.title}
              </div>
              <p className="p-4 text-sm text-dark/75">{service.summary}</p>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/quote" className="btn-primary">
            Get a free quote
          </Link>
        </div>
      </div>
    </div>
  );
}
