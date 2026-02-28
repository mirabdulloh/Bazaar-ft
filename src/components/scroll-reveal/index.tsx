"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ─── Easing curve (typed correctly for framer-motion) ─────────────────────────
const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── FadeInCard ───────────────────────────────────────────────────────────────
/**
 * Wraps a card/item so it fades + slides up when it first renders.
 * Pass `index` to create a stagger delay between siblings.
 *
 * Usage inside a data grid:
 *   {products.map((p, i) => (
 *     <Grid key={p._id} size={{ xs: 12, sm: 6, md: 4 }}>
 *       <FadeInCard index={i}>
 *         <ProductCard product={p} />
 *       </FadeInCard>
 *     </Grid>
 *   ))}
 */
export function FadeInCard({
  children,
  index = 0,
  style,
}: {
  children: ReactNode;
  index?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.48,
        delay: Math.min(index * 0.07, 0.56), // cap at 0.56s so last cards don't wait too long
        ease: EASE_OUT_EXPO,
      }}
      style={{ height: "100%", ...style }}
    >
      {children}
    </motion.div>
  );
}

// ─── FadeInSection ────────────────────────────────────────────────────────────
/**
 * Fades a section heading or block in when it first renders.
 * Useful for section titles, hero text, etc.
 */
export function FadeInSection({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_EXPO }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Default export (kept for any future use) ─────────────────────────────────
export default FadeInCard;
