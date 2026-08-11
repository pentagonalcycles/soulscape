export const INTERESTS = [
  "Art", "Music", "Photography", "Writing", "Poetry",
  "Reading", "Film", "Theatre", "Dance", "Cooking",
  "Travel", "Hiking", "Yoga", "Meditation", "Fitness",
  "Gaming", "Technology", "Science", "History", "Philosophy",
  "Psychology", "Nature", "Animals", "Gardening", "Fashion",
  "Coffee", "Wine", "Street Food", "Stargazing", "Sunsets",
  "Rain", "Mountains", "Ocean", "Cities", "Countryside",
  "Deep Conversations", "Silence", "Laughter", "Dancing", "Singing",
  "Volunteering", "Social Justice", "Spirituality", "Astrology", "Languages",
] as const;

export type Interest = typeof INTERESTS[number];

export const GENDERS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
] as const;

export const INTERESTED_IN = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "everyone", label: "Everyone" },
] as const;

export const DATING_INTENTIONS = [
  { value: "relationship", label: "A relationship", icon: "💜" },
  { value: "something_casual", label: "Something casual", icon: "☁️" },
  { value: "friendship", label: "Friendship first", icon: "🌿" },
  { value: "seeing_whats_out_there", label: "Seeing what's out there", icon: "🌊" },
] as const;

export const REPORT_REASONS = [
  "Fake profile",
  "Inappropriate content",
  "Harassment",
  "Spam",
  "Underage",
  "Other",
] as const;

export const INTENTION_LABELS: Record<string, string> = {
  relationship: "Looking for a relationship",
  something_casual: "Something casual",
  friendship: "Friendship first",
  seeing_whats_out_there: "Seeing what's out there",
};

export const GENDER_LABELS: Record<string, string> = {
  woman: "Woman",
  man: "Man",
  non_binary: "Non-binary",
  other: "Other",
};
