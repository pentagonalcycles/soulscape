export type BrushType =
  | "pen" | "pencil" | "airbrush" | "calligraphy" | "marker" | "eraser"
  | "neon" | "rainbow" | "watercolor" | "fire" | "sparkle" | "galaxy"
  | "chalk" | "oil" | "confetti" | "snow" | "vines" | "electric"
  | "smoke" | "bubbles" | "stars" | "mosaic" | "dna" | "aurora"
  | "ink" | "charcoal" | "halftone" | "pixel" | "spray" | "glitch"
  | "ribbon" | "fur";

export interface MuralRoom {
  id: string;
  name: string;
  theme: string;
  canvas_width: number;
  canvas_height: number;
  created_by: string | null;
  created_at: string;
  is_active: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface StrokeData {
  points: Point[];
  color: string;
  brushType: BrushType;
  brushSize: number;
  opacity: number;
  brushHardness: number;
}

export interface MuralStroke {
  id: string;
  room_id: string;
  user_id: string;
  stroke_data: StrokeData;
  created_at: string;
}

export interface StrokeSegment {
  userId: string;
  from: Point;
  to: Point;
  color: string;
  brushType: BrushType;
  brushSize: number;
  opacity: number;
  brushHardness: number;
}

export interface CursorUpdate {
  userId: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

export interface RoomPresence {
  userId: string;
  color: string;
  name: string;
}

export const CURSOR_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#f43f5e", "#14b8a6", "#a855f7", "#0ea5e9",
];
