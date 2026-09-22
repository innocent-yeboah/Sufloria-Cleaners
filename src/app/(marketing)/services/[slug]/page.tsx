import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, getServiceBySlug } from "@/lib/constants";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const service = getServiceBySlug(params.slug);
  if (!service) return {};
  return {
    title: `${service.title} Derby`,
    description: `${service.summary} Sufloria Cleaners serves Derby and surrounding areas. Request a free quote.`,
  };
}

export default function ServiceDetailPage({ params }: PageProps) {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  return (
    <div className="section-padding">
      <div className="container-site">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-dark">
              {service.title} in Derby
            </p>
            <h1 className="heading-xl mt-2">{service.title}</h1>
            <p className="mt-4 text-dark/75">{service.description}</p>
            <p className="mt-4 text-sm font-semibold text-navy">Who this is for</p>
            <p className="text-dark/75">{service.audience}</p>
            <Link href={`/quote?service=${service.slug}`} className="btn-primary mt-6">
              Get a free quote
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border-[3px] border-gold">
            <Image
              src={service.image}
              alt={service.imageAlt}
              width={1000}
              height={740}
              className="h-72 w-full object-cover"
              priority
            />
            <p className="bg-navy px-4 py-2 text-xs font-bold uppercase tracking-wide text-cream">
              {service.shortTitle}
            </p>
          </div>
        </div>
        <div className="mt-12 overflow-hidden rounded-2xl border-[3px] border-gold bg-white">
          <h2 className="bg-navy px-5 py-3 font-heading text-xl text-gold-light">
            What we focus on
          </h2>
          <ul className="space-y-2 p-5">
            {service.features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-1 inline-block h-2.5 w-3 rotate-[-45deg] border-b-[3px] border-l-[3px] border-gold" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
