import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { POLICY_SECTIONS } from "@/lib/policies";

export const metadata: Metadata = {
  title: "Company Policies",
  description: "How Sufloria Cleaners approaches quality, safety, the environment and your information.",
};

export default function PoliciesPage() {
  return (
    <LegalPage title="Company Policies" updated="22 September 2026">
      {POLICY_SECTIONS.map((section) => (
        <section key={section.id}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </LegalPage>
  );
}
