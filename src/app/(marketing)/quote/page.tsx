import type { Metadata } from "next";
import { Suspense } from "react";
import QuoteForm from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Get a Free Quote",
  description:
    "Request a free, no-obligation property cleaning quote from Sufloria Cleaners in Derby. Tell us about the property and we will come back to you.",
};

export default function QuotePage() {
  return (
    <div className="section-padding">
      <div className="container-site max-w-3xl">
        <p className="section-label">Free, no-obligation quote</p>
        <h1 className="heading-xl">Tell us about the property</h1>
        <p className="mt-3 mb-8 max-w-2xl text-dark/75">
          Need professional cleaning? Share the details and photos. We will provide a
          tailored quotation — no obligation.
        </p>
        <Suspense fallback={<p>Loading form…</p>}>
          <QuoteForm />
        </Suspense>
      </div>
    </div>
  );
}
