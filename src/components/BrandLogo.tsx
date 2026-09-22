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
        src="/brand/logo-mark.png"
        alt=""
        width={945}
        height={555}
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
          <span className={`block font-script text-sm ${light ? "text-gold" : "text-gold-dark"}`}>
            {COMPANY.tagline}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
