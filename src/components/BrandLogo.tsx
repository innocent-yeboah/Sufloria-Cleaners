import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/constants";

type BrandLogoProps = {
  href?: string;
  inverted?: boolean;
  variant?: "light" | "dark";
  showWordmark?: boolean;
};

export default function BrandLogo({
  href = "/",
  inverted = false,
  variant,
  showWordmark = true,
}: BrandLogoProps) {
  const light = inverted || variant === "light";

  return (
    <Link href={href} className="inline-flex items-center gap-3" aria-label={COMPANY.name}>
      <Image
        src="/brand/logo.jpg"
        alt=""
        width={56}
        height={56}
        className="h-12 w-12 rounded-full border-2 border-gold bg-white object-cover"
        priority
      />
      {showWordmark ? (
        <span className="leading-tight">
          <span
            className={`block font-heading text-lg font-bold ${light ? "text-gold-light" : "text-navy"}`}
          >
            {COMPANY.shortName}
          </span>
          <span className={`block font-script text-sm ${light ? "text-gold" : "text-gold-dark"}`}>
            {COMPANY.tagline}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
