import type { Metadata } from "next";
import Link from "next/link";
import ConsentMap from "@/components/ConsentMap";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call, WhatsApp or request a free quote from Sufloria Cleaners in Derby. 07386 544703 · contact@sufloriacleaning.com",
};

export default function ContactPage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-3xl">
        <p className="section-label">Derby and surrounding areas</p>
        <h1 className="heading-xl">Contact Sufloria Cleaners</h1>
        <p className="mt-4 text-dark/75">
          Ready for a cleaner property? Call, WhatsApp or send a quote request. We will
          come back with a tailored, no-obligation quotation.
        </p>
        <div className="gold-frame mt-8 space-y-3 bg-white p-6 sm:p-8">
          <p>
            <strong>Phone:</strong>{" "}
            <a href={COMPANY.phoneHref}>{COMPANY.phoneDisplayLocal}</a>
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </p>
          <p>
            <strong>WhatsApp:</strong>{" "}
            <a
              href={`https://wa.me/${COMPANY.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message us
            </a>
          </p>
          <p>
            <strong>Area:</strong> Derby and surrounding areas
          </p>
        </div>
        <div className="mt-8">
          <ConsentMap />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quote" className="btn-primary">
            Get a free quote
          </Link>
          <Link href="/quote?type=commercial" className="btn-secondary bg-navy">
            Request a commercial quote
          </Link>
        </div>
      </div>
    </div>
  );
}
