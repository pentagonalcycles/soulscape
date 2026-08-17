export interface FilterGrade {
  /** 0..2 brightness multiplier around mid-gray (1 = unchanged). */
  exposure: number;
  /** 0..2 contrast multiplier around 128 (1 = unchanged). */
  contrast: number;
  /** 0..2 saturation multiplier (1 = unchanged). */
  saturation: number;
  /** -1..1 warm (positive = orange, negative = blue) temperature shift. */
  temperature: number;
  /** Blend this RGB color over the frame, 0..1. */
  tint: [number, number, number] | null;
  tintAmount: number;
}

export interface LiveFilter {
  id: string;
  label: string;
  /** Pixel-grade parameters — applied on every browser, guaranteed distinct. */
  grade: FilterGrade;
  /** Darken the corners for a cinematic look. */
  vignette?: boolean;
}

export const LIVE_FILTERS: LiveFilter[] = [
  {
    id: "natural",
    label: "Natural",
    grade: { exposure: 1, contrast: 1, saturation: 1, temperature: 0, tint: null, tintAmount: 0 },
  },
  {
    id: "golden",
    label: "Golden Hour",
    grade: { exposure: 1.15, contrast: 1.12, saturation: 1.45, temperature: 0.5, tint: [255, 165, 70], tintAmount: 0.16 },
    vignette: true,
  },
  {
    id: "arctic",
    label: "Arctic",
    grade: { exposure: 1.12, contrast: 1.2, saturation: 0.8, temperature: -0.6, tint: [120, 200, 255], tintAmount: 0.2 },
    vignette: true,
  },
  {
    id: "noir",
    label: "Noir",
    grade: { exposure: 1.15, contrast: 1.6, saturation: 0, temperature: 0, tint: null, tintAmount: 0 },
    vignette: true,
  },
  {
    id: "emerald",
    label: "Emerald",
    grade: { exposure: 1.1, contrast: 1.12, saturation: 1.5, temperature: 0.2, tint: [30, 190, 130], tintAmount: 0.14 },
    vignette: true,
  },
  {
    id: "violet",
    label: "Violet Dream",
    grade: { exposure: 1.1, contrast: 1.15, saturation: 1.45, temperature: 0.3, tint: [160, 120, 255], tintAmount: 0.16 },
    vignette: true,
  },
  {
    id: "rose",
    label: "Rose",
    grade: { exposure: 1.12, contrast: 1.08, saturation: 1.55, temperature: 0.25, tint: [255, 120, 180], tintAmount: 0.16 },
    vignette: true,
  },
  {
    id: "midnight",
    label: "Midnight",
    grade: { exposure: 0.8, contrast: 1.35, saturation: 0.7, temperature: -0.5, tint: [25, 40, 110], tintAmount: 0.24 },
    vignette: true,
  },
  {
    id: "sunset",
    label: "Sunset",
    grade: { exposure: 1.14, contrast: 1.18, saturation: 1.6, temperature: 0.55, tint: [255, 95, 60], tintAmount: 0.18 },
    vignette: true,
  },
  {
    id: "cool",
    label: "Cool",
    grade: { exposure: 1.08, contrast: 1.1, saturation: 1.3, temperature: -0.4, tint: [80, 175, 255], tintAmount: 0.12 },
  },
];

export function getFilter(id: string): LiveFilter {
  return LIVE_FILTERS.find((f) => f.id === id) || LIVE_FILTERS[0];
}
