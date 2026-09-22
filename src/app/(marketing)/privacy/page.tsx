import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${COMPANY.name} collects and uses personal data under UK GDPR.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="22 September 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          {COMPANY.name} (“we”, “us”) is the data controller for this website and for
          quote enquiries. Email{" "}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or call{" "}
          <a href={COMPANY.phoneHref}>{COMPANY.phoneDisplayLocal}</a>.
        </p>
      </section>
      <section>
        <h2>2. What we collect</h2>
        <p>When you request a quote we may collect your name, email, phone number, property details, postcode, preferred date, notes and photos you upload.</p>
      </section>
      <section>
        <h2>3. Why we use it</h2>
        <ul>
          <li>To prepare a quotation and contact you — legitimate interests and steps prior to a contract.</li>
          <li>To deliver cleaning work you book — contract.</li>
          <li>To keep the website secure — legitimate interests.</li>
        </ul>
      </section>
      <section>
        <h2>4. Sharing</h2>
        <p>We use hosting, email and database providers to run the site. We do not sell your details.</p>
      </section>
      <section>
        <h2>5. Retention</h2>
        <p>Enquiry records are kept for as long as needed to quote, deliver work, and meet legal obligations, then deleted or anonymised.</p>
      </section>
      <section>
        <h2>6. Your rights</h2>
        <p>
          You can ask for access, correction, deletion or restriction, and you can complain to the ICO at ico.org.uk. See our{" "}
          <Link href="/cookies">Cookie Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
