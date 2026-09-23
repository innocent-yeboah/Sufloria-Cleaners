import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <article className="section-padding">
      <div className="container-site max-w-3xl">
        <header className="mb-10">
          <p className="section-label">Legal</p>
          <h1 className="heading-lg">{title}</h1>
          <p className="mt-3 text-sm text-dark/70">Last updated: {updated}</p>
        </header>
        <div className="gold-frame space-y-8 bg-white p-6 sm:p-10 [&_a]:font-semibold [&_a]:text-teal [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_h3]:font-heading [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy sm:[&_h3]:text-lg [&_li]:text-dark/80 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-dark/80 sm:[&_p]:text-base [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </article>
  );
}
