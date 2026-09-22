import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Website terms for ${COMPANY.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="22 September 2026">
      <section>
        <h2>Using this website</h2>
        <p>
          This website is provided by {COMPANY.name} for information and quote requests.
          Quotations are invitations to treat and are not a binding contract until we
          confirm a booking in writing.
        </p>
      </section>
      <section>
        <h2>Quotes</h2>
        <p>
          Quotes are tailored to the property details you provide. If the property differs
          from the description or photos, we may revise the quotation before starting.
        </p>
      </section>
    </LegalPage>
  );
}
