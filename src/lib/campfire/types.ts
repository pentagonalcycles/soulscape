export interface CampfireRoom {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  is_active: boolean;
  is_preset: boolean;
}

export interface CampfireMessage {
  name: string;
  color: string;
  text: string;
  timestamp: number;
  type: "message" | "system" | "typing";
}

export interface CampfirePresence {
  name: string;
  color: string;
}

export const WARM_COLORS = [
  "#f59e0b", "#f97316", "#ef4444", "#e11d48",
  "#dc2626", "#ea580c", "#d97706", "#ca8a04",
  "#b45309", "#9a3412", "#92400e", "#78350f",
];
