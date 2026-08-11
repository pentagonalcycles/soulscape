export interface UnseenProfile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  gender: string;
  interested_in: "men" | "women" | "everyone";
  broad_location: string | null;
  dating_intention: "relationship" | "something_casual" | "friendship" | "seeing_whats_out_there";
  bio: string | null;
  voice_intro_url: string | null;
  is_active: boolean;
  is_verified_18: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnseenPreferences {
  user_id: string;
  age_min: number;
  age_max: number;
  distance_preference: "nearby" | "country" | "anywhere";
  show_me: "men" | "women" | "everyone";
  updated_at: string;
}

export interface UnseenInterest {
  id: string;
  user_id: string;
  interest: string;
}

export interface UnseenQuestion {
  id: string;
  question_text: string;
  category: string | null;
  display_order: number | null;
}

export interface UnseenAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer_text: string;
  created_at: string;
}

export interface UnseenPhoto {
  id: string;
  user_id: string;
  storage_path: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface UnseenDecision {
  id: string;
  decider_id: string;
  target_id: string;
  decision: "interested" | "passed";
  created_at: string;
}

export type RevealStage = "mind" | "voice" | "reveal" | "door" | "ended";

export interface UnseenMatch {
  id: string;
  user_a_id: string;
  user_b_id: string;
  current_stage: RevealStage;
  stage_mind_a: boolean;
  stage_mind_b: boolean;
  stage_voice_a: boolean;
  stage_voice_b: boolean;
  stage_reveal_a: boolean;
  stage_reveal_b: boolean;
  conversation_prompt_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnseenPrompt {
  id: string;
  prompt_text: string;
  category: string | null;
}

export interface UnseenPromptAnswer {
  id: string;
  match_id: string;
  user_id: string;
  answer_text: string;
  created_at: string;
}

export interface UnseenMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface UnseenBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface UnseenReport {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
}

// Composite types for UI
export interface DiscoveryProfile {
  profile: UnseenProfile;
  interests: string[];
  answers: (UnseenAnswer & { question_text: string })[];
  primary_photo_url: string | null; // blurred thumbnail
  compatibility: CompatibilityScore;
}

export interface CompatibilityScore {
  overall: number;
  emotional: number;
  communication: number;
  lifestyle: number;
  interests: number;
}

export interface MatchWithProfile extends UnseenMatch {
  other_profile: UnseenProfile;
  other_interests: string[];
  other_answers: (UnseenAnswer & { question_text: string })[];
  prompt: UnseenPrompt | null;
  my_prompt_answer: UnseenPromptAnswer | null;
  their_prompt_answer: UnseenPromptAnswer | null;
}
