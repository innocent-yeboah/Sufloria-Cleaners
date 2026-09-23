import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { COMPANY } from "@/lib/constants";
import { POLICY_INTRO, POLICY_SECTIONS } from "@/lib/policies";

export const metadata: Metadata = {
  title: "Company Policies",
  description: `Clear rules and expectations for bookings, payment, guarantees, health & safety, insurance, staff conduct and terms of service from ${COMPANY.name}.`,
};

export default function PoliciesPage() {
  return (
    <LegalPage title="Company Policies" updated="23 September 2026">
      <p>{POLICY_INTRO}</p>

      <nav aria-label="Policy index" className="not-prose rounded-2xl border-2 border-gold/40 bg-cream/40 p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-navy">
          Clear rules, clear expectations
        </p>
        <ol className="!list-none !space-y-2 !pl-0">
          {POLICY_SECTIONS.map((section) => (
            <li key={section.id} className="!text-sm">
              <a
                href={`#${section.id}`}
                className="inline-flex gap-3 font-semibold text-navy no-underline hover:text-teal"
              >
                <span className="font-heading text-gold-dark">{section.number}</span>
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {POLICY_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">
            {section.number}
          </p>
          <h2>{section.title}</h2>
          <p className="!text-dark/65 !italic">{section.summary}</p>
          {section.blocks.map((block, index) => {
            if (block.type === "h3") {
              return (
                <h3
                  key={`${section.id}-h3-${index}`}
                  className="!mt-6 !font-heading !text-base !font-bold !text-navy sm:!text-lg"
                >
                  {block.text}
                </h3>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={`${section.id}-ul-${index}`}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            const emailMatch = block.text.includes(COMPANY.email);
            const phoneMatch = block.text.includes(COMPANY.phone);
            if (emailMatch || phoneMatch) {
              const parts = block.text.split(
                new RegExp(`(${COMPANY.email}|${COMPANY.phone.replace("+", "\\+")})`, "g")
              );
              return (
                <p key={`${section.id}-p-${index}`}>
                  {parts.map((part, i) => {
                    if (part === COMPANY.email) {
                      return (
                        <a key={i} href={`mailto:${COMPANY.email}`}>
                          {COMPANY.email}
                        </a>
                      );
                    }
                    if (part === COMPANY.phone) {
                      return (
                        <a key={i} href={COMPANY.phoneHref}>
                          {COMPANY.phoneDisplayLocal}
                        </a>
                      );
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </p>
              );
            }
            return <p key={`${section.id}-p-${index}`}>{block.text}</p>;
          })}
        </section>
      ))}

      <p>
        Prefer a quick conversation? Call{" "}
        <a href={COMPANY.phoneHref}>{COMPANY.phoneDisplayLocal}</a> or email{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. See also our{" "}
        <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
