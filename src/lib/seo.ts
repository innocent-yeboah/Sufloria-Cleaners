import { COMPANY, SERVICE_AREAS, SERVICES } from "@/lib/constants";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://sufloriacleaners.com").replace(
    /\/$/,
    ""
  );
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildOrganizationJsonLd() {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    "@id": `${url}/#organization`,
    name: COMPANY.name,
    alternateName: COMPANY.shortName,
    description: `${COMPANY.uspHeadline} ${COMPANY.heroSubheadline}.`,
    url,
    email: COMPANY.email,
    telephone: COMPANY.phoneHref.replace("tel:", ""),
    image: absoluteUrl("/brand/logo-seal.png"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/logo-seal.png"),
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: COMPANY.address.addressLocality,
      addressCountry: COMPANY.address.addressCountry,
    },
    areaServed: SERVICE_AREAS.regions.map((region) => ({
      "@type": "AdministrativeArea",
      name: region,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "16:00",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: COMPANY.email,
        telephone: COMPANY.phoneHref.replace("tel:", ""),
        areaServed: "GB",
        availableLanguage: ["English"],
      },
    ],
    sameAs: [] as string[],
    priceRange: "$$",
    currenciesAccepted: "GBP",
    paymentAccepted: "Bank Transfer, Card",
    knowsAbout: SERVICES.map((service) => service.title),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Property cleaning services",
      itemListElement: SERVICES.map((service, index) => ({
        "@type": "Offer",
        position: index + 1,
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.summary,
          url: absoluteUrl(`/services/${service.slug}`),
          provider: { "@id": `${url}/#organization` },
          areaServed: "Derby",
        },
      })),
    },
  };
}

export function buildWebsiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: COMPANY.shortName,
    description: `${COMPANY.tagline}. ${COMPANY.uspHeadline}`,
    inLanguage: "en-GB",
    publisher: { "@id": `${url}/#organization` },
  };
}
