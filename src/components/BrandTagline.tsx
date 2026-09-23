import { COMPANY } from "@/lib/constants";

/** Brand tagline in the site script font (same face throughout). */
export default function BrandTagline({ className = "" }: { className?: string }) {
  return <span className={className}>{COMPANY.tagline}</span>;
}
