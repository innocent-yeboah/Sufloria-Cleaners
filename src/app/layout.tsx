import type { Metadata } from "next";
import { Great_Vibes, Inter, Playfair_Display } from "next/font/google";
import { CookieConsentProvider } from "@/components/CookieConsent";
import SkipToContent from "@/components/SkipToContent";
import JsonLd from "@/components/JsonLd";
import {
  absoluteUrl,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  getSiteUrl,
} from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const script = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
  weight: "400",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cleaning Company Derby | Sufloria Cleaners",
    template: "%s | Sufloria Cleaners",
  },
  description:
    "Sufloria Cleaners is a trusted cleaning company in Derby, providing commercial cleaning and end of tenancy cleaning. Request your free quote today.",
  keywords: [
    "cleaning company Derby",
    "end of tenancy cleaners Derby",
    "after builders cleaning Derby",
    "commercial cleaners Derby",
    "Sufloria Cleaners",
  ],
  openGraph: {
    title: "Cleaning Company Derby | Sufloria Cleaners",
    description:
      "Sufloria Cleaners is a trusted cleaning company in Derby, providing commercial cleaning and end of tenancy cleaning. Request your free quote today.",
    url: siteUrl,
    siteName: "Sufloria Cleaners",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: absoluteUrl("/brand/banner.jpg"),
        width: 1200,
        height: 630,
        alt: "Sufloria Cleaners — A Higher Standard of Clean",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cleaning Company Derby | Sufloria Cleaners",
    description:
      "Sufloria Cleaners is a trusted cleaning company in Derby, providing commercial cleaning and end of tenancy cleaning. Request your free quote today.",
  },
  icons: {
    icon: [{ url: "/brand/logo.jpg" }],
    apple: [{ url: "/brand/logo.jpg" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={`${playfair.variable} ${inter.variable} ${script.variable}`}>
        <CookieConsentProvider>
          <SkipToContent />
          <JsonLd data={buildOrganizationJsonLd()} />
          <JsonLd data={buildWebsiteJsonLd()} />
          {children}
        </CookieConsentProvider>
      </body>
    </html>
  );
}
