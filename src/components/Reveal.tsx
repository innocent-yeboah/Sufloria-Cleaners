"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: "up" | "left" | "right" | "fade" | "scale";
  delay?: number;
  threshold?: number;
  once?: boolean;
};

/**
 * Scroll reveal with progressive enhancement.
 * Content is visible by default (SSR / no-JS). Animation only applies
 * to below-the-fold elements after client mount.
 */
export default function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  threshold = 0.12,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(true);
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAnimate(false);
      setRevealed(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.95 && rect.bottom > 40;

    setAnimate(true);
    setRevealed(inView);

    if (inView && once) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  const style = {
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  const motionClass = animate
    ? `reveal reveal-${variant}${revealed ? " is-revealed" : ""}`
    : "";

  return (
    <div
      ref={ref}
      style={style}
      className={`${motionClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
