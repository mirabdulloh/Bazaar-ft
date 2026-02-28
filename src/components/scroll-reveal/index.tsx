"use client";

import { useEffect, useRef, useState, type PropsWithChildren } from "react";

// ─── ScrollReveal ─────────────────────────────────────────────────────────────
interface ScrollRevealProps extends PropsWithChildren {
  style?: React.CSSProperties;
  delayMs?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  style,
  delayMs = 0,
  threshold = 0.12,
  rootMargin = "0px 0px -8% 0px",
  once = true,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = elementRef.current;
    if (!target) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
          return;
        }

        if (!once) setIsVisible(false);
      },
      { threshold, rootMargin }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return (
    <div
      ref={elementRef}
      style={{
        transition: "opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(48px)",
        ...(delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── FadeInCard ───────────────────────────────────────────────────────────────
/**
 * Scroll-triggered fade + slide-up for cards in a grid.
 * Pass `index` to stagger siblings.
 */
export function FadeInCard({
  children,
  index = 0,
  style,
}: {
  children: React.ReactNode;
  index?: number;
  style?: React.CSSProperties;
}) {
  return (
    <ScrollReveal delayMs={Math.min(index * 70, 420)} style={{ height: "100%", ...style }}>
      {children}
    </ScrollReveal>
  );
}

// ─── FadeInSection ────────────────────────────────────────────────────────────
export function FadeInSection({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <ScrollReveal delayMs={delay * 1000} style={style}>
      {children}
    </ScrollReveal>
  );
}

export default FadeInCard;
