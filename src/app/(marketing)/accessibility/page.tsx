import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Accessibility",
  description: `Accessibility information for the ${COMPANY.name} website.`,
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility" updated="22 September 2026">
      <section>
        <h2>Our aim</h2>
        <p>
          We want this website to be usable with keyboards, screen readers and reduced
          motion settings. If something is in the way, email{" "}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we will work on it.
        </p>
      </section>
    </LegalPage>
  );
}
