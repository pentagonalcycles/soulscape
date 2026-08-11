export type NeraType =
  | "quiet_coffee"
  | "walk_and_talk"
  | "create_together"
  | "lets_eat"
  | "game_night"
  | "music_people"
  | "deep_conversation"
  | "fresh_air"
  | "need_company"
  | "something_spontaneous"
  | "online_tonight";

export type NeraEmotion =
  | "need_company"
  | "want_to_talk"
  | "want_distraction"
  | "feel_spontaneous"
  | "meet_someone_new"
  | "quiet_day"
  | "want_adventure"
  | "surprise_me";

export type NeraStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type AttendeeStatus = "joined" | "pending" | "left";
export type JoinRequestStatus = "pending" | "approved" | "denied";

export interface Nera {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  nera_type: NeraType;
  emotion_tags: NeraEmotion[];
  location_name: string | null;
  city: string | null;
  approximate_location: string | null;
  lat: number | null;
  lng: number | null;
  is_online: boolean;
  is_public: boolean;
  date_time: string;
  max_participants: number;
  current_participants: number;
  image_url: string | null;
  status: NeraStatus;
  created_at: string;
  updated_at: string;
}

export interface NeraAttendee {
  id: string;
  nera_id: string;
  user_id: string;
  status: AttendeeStatus;
  joined_at: string;
}

export interface NeraJoinRequest {
  id: string;
  nera_id: string;
  user_id: string;
  message: string | null;
  status: JoinRequestStatus;
  created_at: string;
}

export interface NeraMessage {
  id: string;
  nera_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface NeraReport {
  id: string;
  reporter_id: string;
  nera_id: string;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
}

export interface NeraWithMeta extends Nera {
  host_name: string;
  host_avatar: string | null;
  user_attendee_status: AttendeeStatus | null;
  is_host: boolean;
  attendee_names: { name: string; avatar: string | null }[];
  distance_miles?: number;
}
