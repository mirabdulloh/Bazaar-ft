import { colornames as colorList } from "color-name-list/bestof";

const COLOR_DB = new Map(colorList.map((c) => [c.name.toLowerCase(), c.hex]));

/**
 * Converts a brand color name (e.g. "Heather Grey", "White/Blue", "Core Black")
 * to a CSS hex color. Falls back gracefully to CSS named color or neutral grey.
 */
export function toCssColor(name: string): string {
  const lower = name.toLowerCase();

  // 1. Exact match
  if (COLOR_DB.has(lower)) return COLOR_DB.get(lower)!;

  // 2. First segment before / or -
  const segment = lower.split(/[/,\-]/)[0].trim();
  if (COLOR_DB.has(segment)) return COLOR_DB.get(segment)!;

  // 3. Try each word (last → first), e.g. "heather grey" → "grey"
  const words = segment.split(/\s+/);
  for (const word of [...words].reverse()) {
    if (COLOR_DB.has(word)) return COLOR_DB.get(word)!;
  }

  // 4. Use last word as CSS named color (works for standard names like "black", "navy")
  return words[words.length - 1];
}
