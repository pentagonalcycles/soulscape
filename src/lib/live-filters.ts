export interface LiveFilter {
  id: string;
  label: string;
  /** Canvas ctx.filter value ("" for natural). Applied to the actual outgoing frame. */
  css: string;
  /** Special composite: blurred background + sharp center. */
  backgroundBlur?: boolean;
}

export const LIVE_FILTERS: LiveFilter[] = [
  { id: "natural", label: "Natural", css: "" },
  { id: "soft", label: "Soft", css: "brightness(1.06) saturate(0.85) contrast(0.9)" },
  { id: "warm", label: "Warm", css: "sepia(0.28) saturate(1.2) brightness(1.04) hue-rotate(-8deg)" },
  { id: "cool", label: "Cool", css: "saturate(1.1) hue-rotate(12deg) brightness(1.02)" },
  { id: "film", label: "Film", css: "contrast(1.1) saturate(0.78) sepia(0.18) brightness(0.95)" },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.08)" },
  { id: "dream", label: "Dream", css: "brightness(1.1) saturate(1.3) contrast(0.88) blur(1.5px)" },
  { id: "high-contrast", label: "High Contrast", css: "contrast(1.45) saturate(1.2)" },
  { id: "low-light", label: "Low Light", css: "brightness(1.28) contrast(1.1)" },
  { id: "vintage", label: "Vintage", css: "sepia(0.5) contrast(0.9) brightness(0.96) saturate(0.8)" },
  { id: "soft-glow", label: "Soft Glow", css: "brightness(1.12) saturate(1.15) contrast(0.92) blur(1px)" },
  { id: "background-blur", label: "Background Blur", css: "", backgroundBlur: true },
];

export function getFilter(id: string): LiveFilter {
  return LIVE_FILTERS.find((f) => f.id === id) || LIVE_FILTERS[0];
}