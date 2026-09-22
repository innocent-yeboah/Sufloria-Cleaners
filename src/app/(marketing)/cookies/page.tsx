import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Sufloria Cleaners uses cookies on sufloriacleaning.com.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="22 September 2026">
      <section>
        <h2>Cookies we use</h2>
        <p>
          Strictly necessary cookies run the site and remember your cookie choice. Optional
          functional cookies may enable embeds. Analytics cookies are reserved and not
          currently active.
        </p>
      </section>
      <section>
        <h2>Your choice</h2>
        <p>
          You can accept all, reject non-essential cookies, or manage preferences from the
          banner. This site is designed to meet UK PECR rules for non-essential cookies.
        </p>
      </section>
    </LegalPage>
  );
}
