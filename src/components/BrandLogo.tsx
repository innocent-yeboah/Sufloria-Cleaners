import Image from "next/image";
import Link from "next/link";
import BrandTagline from "@/components/BrandTagline";
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
        src="/brand/logo-mark.png"
        alt=""
        width={945}
        height={488}
        unoptimized
        className="h-16 w-auto object-contain drop-shadow-sm sm:h-[4.5rem]"
        priority
      />
      {showWordmark ? (
        <span className="leading-tight">
          <span
            className={`block font-heading text-lg font-bold sm:text-xl ${light ? "text-gold-light" : "text-navy"}`}
          >
            {COMPANY.name}
          </span>
          <BrandTagline
            className={`block font-script text-lg leading-snug tracking-wide sm:text-xl ${light ? "text-gold" : "text-gold-dark"}`}
          />
        </span>
      ) : null}
    </Link>
  );
}
