import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sufloriacleaners.com";
  const routes = [
    "",
    "/services",
    "/about",
    "/contact",
    "/quote",
    "/policies",
    "/privacy",
    "/cookies",
    "/terms",
    "/accessibility",
    ...SERVICES.map((service) => `/services/${service.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : route.startsWith("/services/") ? 0.8 : 0.6,
  }));
}
