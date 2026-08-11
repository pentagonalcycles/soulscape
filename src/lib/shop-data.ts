export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: string;
  categoryLabel: string;
  badge?: string;
  featured?: boolean;
  includes?: string[];
  hasAudio?: boolean;
}

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "journals", label: "Digital Journals" },
  { id: "wallpapers", label: "Wallpapers" },
  { id: "soundscapes", label: "Soundscapes" },
  { id: "profiles", label: "Profile Themes" },
  { id: "membership", label: "Membership" },
  { id: "gifts", label: "Gifts" },
  { id: "support", label: "Support" },
] as const;

export const FEATURED_PRODUCTS: ShopProduct[] = [
  {
    id: "the-inner-world-journal",
    name: "The Inner World Journal",
    description: "A guided digital journal for emotions, reflection and self-discovery.",
    longDescription:
      "A beautifully crafted 120-page digital journal with daily prompts, mood tracking pages, and reflective exercises designed to guide you through your inner world. Each page is designed with care — soft gradients, gentle typography, and space for your thoughts to breathe.",
    price: 6.99,
    category: "journals",
    categoryLabel: "Digital Journal",
    badge: "Featured",
    featured: true,
    includes: [
      "120-page guided journal (PDF)",
      "Daily reflection prompts",
      "Mood tracking pages",
      "Printable & digital-friendly layout",
      "3 colour themes included",
    ],
  },
  {
    id: "celestial-profile-theme",
    name: "Celestial Profile Theme",
    description: "A glowing cosmic profile theme with animated stars and aura effects.",
    longDescription:
      "Transform your Elovayne profile into a glowing cosmic sanctuary. This premium theme includes animated floating stars, a soft violet aura effect, custom gradient backgrounds, and animated borders that breathe gently.",
    price: 3.99,
    category: "profiles",
    categoryLabel: "Profile Theme",
    badge: "Featured",
    featured: true,
    includes: [
      "Animated starfield background",
      "Violet aura glow effect",
      "Custom gradient overlays",
      "Animated breathing borders",
      "Instant profile activation",
    ],
  },
  {
    id: "midnight-sanctuary-soundscape",
    name: "Midnight Sanctuary Soundscape",
    description: "A calming collection of atmospheric sounds for sleep, focus and emotional release.",
    longDescription:
      "Six original ambient soundscapes created to accompany journaling, meditation, or quiet moments. Each track is 10-15 minutes of carefully layered atmospheric sounds — rain, forest whispers, ocean waves, and celestial tones.",
    price: 4.99,
    category: "soundscapes",
    categoryLabel: "Soundscape",
    badge: "Featured",
    featured: true,
    hasAudio: true,
    includes: [
      "6 ambient soundscapes (MP3, 320kbps)",
      "10-15 minutes per track",
      "Midnight Rain",
      "The Quiet Forest",
      "Celestial Sleep",
      "Ocean After Dark",
      "Deep Focus Sanctuary",
      "Gentle Drift",
    ],
  },
];

export const JOURNALS: ShopProduct[] = [
  {
    id: "healing-journal",
    name: "Healing Journal",
    description: "A gentle guided journal for processing pain, finding peace, and nurturing self-compassion.",
    longDescription:
      "A 90-page guided journal designed to help you navigate healing at your own pace. Includes grief processing pages, self-compassion exercises, body-based grounding prompts, and a weekly reflection tracker.",
    price: 7.99,
    category: "journals",
    categoryLabel: "Digital Journal",
    includes: [
      "90-page guided journal (PDF)",
      "Grief processing worksheets",
      "Self-compassion exercises",
      "Body-based grounding prompts",
      "Weekly reflection tracker",
    ],
  },
  {
    id: "dream-journal",
    name: "Dream Journal",
    description: "Capture and explore the meaning of your dreams with guided prompts and symbol tracking.",
    longDescription:
      "A beautifully illustrated 80-page journal for recording and reflecting on your dreams. Each entry includes space for dream narrative, symbol analysis, emotional themes, and personal meaning.",
    price: 5.99,
    category: "journals",
    categoryLabel: "Digital Journal",
    includes: [
      "80-page dream journal (PDF)",
      "Dream symbol reference guide",
      "Emotional theme tracker",
      "Lucid dreaming prompts",
      "Nightly reflection pages",
    ],
  },
  {
    id: "anxiety-reset-journal",
    name: "Anxiety Reset Journal",
    description: "Practical exercises and gentle prompts to help calm an anxious mind.",
    longDescription:
      "A 70-page journal combining evidence-based anxiety management techniques with gentle, creative prompts. Includes breathing exercises, worry dumps, cognitive reframing pages, and a calm-down toolkit.",
    price: 6.99,
    category: "journals",
    categoryLabel: "Digital Journal",
    includes: [
      "70-page guided journal (PDF)",
      "Breathing exercise guides",
      "Worry dump worksheets",
      "Cognitive reframing pages",
      "Calm-down toolkit",
    ],
  },
  {
    id: "self-discovery-journal",
    name: "Self-Discovery Journal",
    description: "Explore who you are, what you value, and where your heart wants to go.",
    longDescription:
      "A 100-page journal with thought-provoking prompts designed to help you uncover your values, strengths, dreams, and authentic self. Includes personality reflections, values clarification exercises, and future-self lettering pages.",
    price: 8.99,
    category: "journals",
    categoryLabel: "Digital Journal",
    includes: [
      "100-page guided journal (PDF)",
      "Values clarification exercises",
      "Strengths discovery pages",
      "Future-self letter prompts",
      "Monthly self-discovery review",
    ],
  },
  {
    id: "gratitude-journal",
    name: "Gratitude Journal",
    description: "A daily practice of noticing the small, beautiful things that often go unseen.",
    longDescription:
      "A 60-page minimalist gratitude journal with space for daily gratitude entries, weekly themes, and monthly reflections. Designed with soft, calming aesthetics to make your daily practice feel like a gentle ritual.",
    price: 3.99,
    category: "journals",
    categoryLabel: "Digital Journal",
    includes: [
      "60-page gratitude journal (PDF)",
      "Daily gratitude prompts",
      "Weekly reflection themes",
      "Monthly overview pages",
      "Printable minimalist design",
    ],
  },
  {
    id: "relationship-reflection-journal",
    name: "Relationship Reflection Journal",
    description: "Navigate the complexity of relationships with clarity and compassion.",
    longDescription:
      "A 75-page journal for reflecting on your relationships — romantic, familial, friendships, and self. Includes boundary-setting exercises, communication reflection pages, and forgiveness practices.",
    price: 7.99,
    category: "journals",
    categoryLabel: "Digital Journal",
    includes: [
      "75-page guided journal (PDF)",
      "Boundary-setting worksheets",
      "Communication reflection pages",
      "Forgiveness practices",
      "Relationship inventory tool",
    ],
  },
];

export const WALLPAPERS: ShopProduct[] = [
  {
    id: "celestial-phone-wallpaper-pack",
    name: "Celestial Phone Wallpaper Pack",
    description: "A curated set of 12 ethereal wallpapers for your daily calm.",
    longDescription:
      "12 stunning wallpapers inspired by the Elovayne cosmos — nebulae, constellations, and soft gradients. Each designed in both iPhone and Android dimensions with optional clock-friendly layouts.",
    price: 2.99,
    category: "wallpapers",
    categoryLabel: "Wallpaper Pack",
    includes: [
      "12 high-resolution wallpapers",
      "iPhone & Android dimensions",
      "Clock-friendly layouts",
      "PNG & JPG formats",
    ],
  },
  {
    id: "emotional-aura-wallpaper-pack",
    name: "Emotional Aura Wallpaper Pack",
    description: "Colour-driven wallpapers that mirror the spectrum of human emotion.",
    longDescription:
      "8 wallpapers that explore the emotional colour spectrum — from the deep blues of melancholy to the warm golds of hope. Each wallpaper uses soft gradients and aurora-like effects to create a calming visual experience.",
    price: 3.99,
    category: "wallpapers",
    categoryLabel: "Wallpaper Pack",
    includes: [
      "8 emotional aura wallpapers",
      "Multiple device sizes",
      "Colour spectrum themes",
      "High-resolution PNG files",
    ],
  },
  {
    id: "midnight-garden-desktop-pack",
    name: "Midnight Garden Desktop Pack",
    description: "Desktop wallpapers featuring a mystical midnight garden aesthetic.",
    longDescription:
      "6 desktop wallpapers featuring a serene midnight garden — moonlit flowers, soft fireflies, and starlit skies. Perfect for creating a calm, dreamlike workspace.",
    price: 4.99,
    category: "wallpapers",
    categoryLabel: "Wallpaper Pack",
    includes: [
      "6 desktop wallpapers (4K)",
      "Multiple monitor sizes",
      "Moonlit garden aesthetic",
      "PNG & JPG formats",
    ],
  },
  {
    id: "elovayne-symbol-collection",
    name: "Elovayne Symbol Collection",
    description: "A collection of Elovayne symbols and icons for personal use.",
    longDescription:
      "A curated set of 20 Elovayne symbols — the sanctuary star, the breath circle, the hope constellation, and more. Each symbol is provided in multiple formats for use as profile pictures, social media icons, or personal tokens.",
    price: 1.99,
    category: "wallpapers",
    categoryLabel: "Digital Art",
    includes: [
      "20 unique Elovayne symbols",
      "PNG, SVG & PDF formats",
      "Transparent backgrounds",
      "Multiple sizes included",
    ],
  },
  {
    id: "animated-sanctuary-backgrounds",
    name: "Animated Sanctuary Backgrounds",
    description: "Gentle animated backgrounds for your devices.",
    longDescription:
      "5 looping animated backgrounds featuring soft particle effects, drifting nebulae, and breathing light orbs. Available as MP4 and GIF files for use as live wallpapers or video backgrounds.",
    price: 5.99,
    category: "wallpapers",
    categoryLabel: "Animated Wallpaper",
    includes: [
      "5 animated backgrounds",
      "MP4 & GIF formats",
      "Looping seamless playback",
      "Multiple resolutions",
    ],
  },
];

export const SOUNDSCAPES: ShopProduct[] = [
  {
    id: "midnight-rain",
    name: "Midnight Rain",
    description: "Soft rain falling on a quiet window, distant thunder, gentle release.",
    longDescription:
      "A 12-minute soundscape of midnight rain — the gentle patter of rain on glass, distant rolling thunder, and the occasional creak of an old house settling. Designed to evoke a sense of warmth and safety.",
    price: 3.99,
    category: "soundscapes",
    categoryLabel: "Soundscape",
    hasAudio: true,
    includes: [
      "12-minute ambient track (MP3, 320kbps)",
      "High-fidelity recording",
      "Seamless loop-ready ending",
      "Instant digital download",
    ],
  },
  {
    id: "the-quiet-forest",
    name: "The Quiet Forest",
    description: "Birdsong, rustling leaves, and the deep stillness of an ancient wood.",
    longDescription:
      "A 14-minute journey through a quiet forest. Layered birdsong, gentle wind through leaves, distant brook sounds, and the deep ambient silence of an ancient wood. Perfect for meditation or quiet reflection.",
    price: 4.99,
    category: "soundscapes",
    categoryLabel: "Soundscape",
    hasAudio: true,
    includes: [
      "14-minute ambient track (MP3, 320kbps)",
      "Multi-layered forest sounds",
      "Dawn chorus & evening variants",
      "Seamless loop-ready ending",
    ],
  },
  {
    id: "celestial-sleep",
    name: "Celestial Sleep",
    description: "Drifting cosmic tones and soft frequencies to guide you into deep rest.",
    longDescription:
      "A 15-minute sleep soundscape combining low celestial drones, soft harmonic frequencies, and gentle spatial movement. Designed to calm the nervous system and ease the transition into sleep.",
    price: 5.99,
    category: "soundscapes",
    categoryLabel: "Soundscape",
    hasAudio: true,
    includes: [
      "15-minute sleep track (MP3, 320kbps)",
      "Binaural frequency layering",
      "Gradual volume fade",
      "Optimised for headphone listening",
    ],
  },
  {
    id: "ocean-after-dark",
    name: "Ocean After Dark",
    description: "The ocean at night — waves, distant ships, and the vast silence of water.",
    longDescription:
      "A 13-minute soundscape of the ocean after dark. Rhythmic waves on shore, the distant hum of a passing ship, and the deep, vast silence of open water under stars.",
    price: 3.99,
    category: "soundscapes",
    categoryLabel: "Soundscape",
    hasAudio: true,
    includes: [
      "13-minute ambient track (MP3, 320kbps)",
      "Rhythmic wave patterns",
      "Distant maritime sounds",
      "Seamless loop-ready ending",
    ],
  },
  {
    id: "deep-focus-sanctuary",
    name: "Deep Focus Sanctuary",
    description: "Ambient tones designed to help you concentrate, create, and flow.",
    longDescription:
      "A 15-minute focus soundscape with warm ambient pads, gentle rhythmic pulses, and subtle harmonic layers. Designed to support deep concentration without distraction.",
    price: 6.99,
    category: "soundscapes",
    categoryLabel: "Soundscape",
    hasAudio: true,
    includes: [
      "15-minute focus track (MP3, 320kbps)",
      "Warm ambient textures",
      "Subtle rhythmic pulse",
      "Designed for extended listening",
    ],
  },
];

export const PROFILE_THEMES: ShopProduct[] = [
  {
    id: "celestial-theme",
    name: "Celestial Theme",
    description: "A glowing cosmic profile with animated stars and violet aura.",
    longDescription:
      "Transform your profile into a cosmic sanctuary with animated floating stars, violet aura effects, and gradient backgrounds that shift gently between deep purple and midnight blue.",
    price: 3.99,
    category: "profiles",
    categoryLabel: "Profile Theme",
    includes: ["Animated starfield background", "Violet aura glow", "Custom gradient overlays", "Instant activation"],
  },
  {
    id: "moonlit-garden-theme",
    name: "Moonlit Garden Theme",
    description: "Soft moonlight, fireflies, and a dreamy garden atmosphere.",
    longDescription:
      "A serene profile theme featuring soft moonlight effects, animated firefly particles, and a gentle garden atmosphere with lavender and sage colour tones.",
    price: 3.99,
    category: "profiles",
    categoryLabel: "Profile Theme",
    includes: ["Moonlight glow effects", "Animated firefly particles", "Lavender & sage palette", "Instant activation"],
  },
  {
    id: "dream-aura-theme",
    name: "Dream Aura Theme",
    description: "A soft, breathing aura effect with pastel cosmic colours.",
    longDescription:
      "A gentle, breathing aura effect surrounds your profile with soft pastel cosmic colours — rose, lavender, and soft gold. The effect pulses slowly, creating a calming visual presence.",
    price: 3.99,
    category: "profiles",
    categoryLabel: "Profile Theme",
    includes: ["Breathing aura animation", "Pastel cosmic palette", "Gentle pulse effect", "Instant activation"],
  },
  {
    id: "golden-eclipse-theme",
    name: "Golden Eclipse Theme",
    description: "Warm golden light with deep shadow contrasts.",
    longDescription:
      "A dramatic yet warm profile theme featuring golden eclipse lighting, deep shadow contrasts, and subtle particle effects that evoke the beauty of a solar eclipse.",
    price: 4.99,
    category: "profiles",
    categoryLabel: "Profile Theme",
    includes: ["Golden eclipse lighting", "Deep shadow effects", "Warm particle accents", "Instant activation"],
  },
  {
    id: "animated-profile-border",
    name: "Animated Profile Border",
    description: "A glowing, breathing border effect for your profile picture.",
    longDescription:
      "Add a beautiful animated border to your profile picture that breathes gently with a violet glow. The border pulses softly, creating a living, breathing frame around your avatar.",
    price: 2.99,
    category: "profiles",
    categoryLabel: "Profile Customisation",
    includes: ["Animated breathing border", "Violet glow effect", "Multiple border styles", "Instant activation"],
  },
  {
    id: "exclusive-elovayne-symbols",
    name: "Exclusive Elovayne Symbols",
    description: "Premium symbols and icons for your profile and messages.",
    longDescription:
      "A collection of 30 premium Elovayne symbols — exclusive to Plus members. Use them in your profile, messages, and posts to express yourself with the unique visual language of the sanctuary.",
    price: 2.99,
    category: "profiles",
    categoryLabel: "Digital Collection",
    includes: ["30 premium symbols", "Profile & message use", "Exclusive designs", "Instant access"],
  },
  {
    id: "particle-effect-pack",
    name: "Particle Effect Pack",
    description: "Animated particle effects that float around your profile.",
    longDescription:
      "Choose from 8 beautiful particle effects — rising stars, drifting petals, floating orbs, cosmic dust, and more. These gentle animations create a living atmosphere around your profile.",
    price: 3.99,
    category: "profiles",
    categoryLabel: "Profile Customisation",
    includes: ["8 particle effect styles", "Adjustable intensity", "Performance-optimised", "Instant activation"],
  },
  {
    id: "custom-profile-card-pack",
    name: "Custom Profile Card Pack",
    description: "Beautifully designed profile card layouts to showcase your identity.",
    longDescription:
      "5 premium profile card layouts with different arrangements of your name, bio, and statistics. Each card features glassmorphism effects, custom typography, and subtle animations.",
    price: 4.99,
    category: "profiles",
    categoryLabel: "Profile Customisation",
    includes: ["5 profile card layouts", "Glassmorphism effects", "Custom typography", "Instant activation"],
  },
];

export const MEMBERSHIP_PRODUCT: ShopProduct = {
  id: "elovayne-plus",
  name: "Elovayne Plus",
  description: "Unlock a deeper, more personal sanctuary experience.",
  longDescription:
    "Elovayne Plus unlocks a more personal and immersive experience while helping support the future of the community. Enjoy exclusive content, premium features, and the knowledge that you are helping keep this sanctuary alive.",
  price: 4.99,
  category: "membership",
  categoryLabel: "Membership",
  includes: [
    "Exclusive profile themes",
    "Premium journals",
    "Additional profile customisation",
    "Early access to new features",
    "Exclusive soundscapes",
    "Supporter badge",
    "Monthly digital gift",
  ],
};

export const GIFT_OPTIONS: ShopProduct[] = [
  {
    id: "gift-one-month-plus",
    name: "Gift One Month of Elovayne Plus",
    description: "Give someone a month of premium sanctuary access.",
    longDescription:
      "Gift a full month of Elovayne Plus to someone who needs it. They will receive access to all premium features, exclusive content, and a supporter badge for the duration of the gift.",
    price: 4.99,
    category: "gifts",
    categoryLabel: "Gift",
    includes: ["1 month of Elovayne Plus", "All premium features", "Supporter badge", "Personalised gift message"],
  },
  {
    id: "gift-digital-journal",
    name: "Gift a Digital Journal",
    description: "Share the gift of reflection and self-discovery.",
    longDescription:
      "Choose one of our beautifully crafted digital journals to gift to someone. Include a personal message to let them know you are thinking of them.",
    price: 6.99,
    category: "gifts",
    categoryLabel: "Gift",
    includes: ["One digital journal of your choice", "Personalised gift message", "Instant digital delivery", "Choice of 6 journals"],
  },
  {
    id: "gift-profile-theme",
    name: "Gift a Profile Theme",
    description: "Help someone beautify their sanctuary space.",
    longDescription:
      "Gift a premium profile theme to someone who would love to personalise their Elovayne experience. Choose from any of our available themes.",
    price: 3.99,
    category: "gifts",
    categoryLabel: "Gift",
    includes: ["One profile theme of your choice", "Personalised gift message", "Instant digital delivery", "Choice of 8 themes"],
  },
  {
    id: "gift-soundscape-collection",
    name: "Gift a Soundscape Collection",
    description: "Give the gift of calm with ambient soundscapes.",
    longDescription:
      "Gift a collection of calming soundscapes to someone who could use some peace. Choose from our curated collections or build a custom bundle.",
    price: 5.99,
    category: "gifts",
    categoryLabel: "Gift",
    includes: ["Soundscape collection of your choice", "Personalised gift message", "Instant digital delivery", "Up to 6 tracks"],
  },
  {
    id: "send-digital-comfort-card",
    name: "Send a Digital Comfort Card",
    description: "A gentle, animated card to let someone know you care.",
    longDescription:
      "Send a beautiful animated comfort card to someone who needs a gentle reminder that they are not alone. Choose from 10 designs and add a personal message.",
    price: 1.99,
    category: "gifts",
    categoryLabel: "Gift",
    includes: ["10 animated card designs", "Personalised message", "Anonymous or named sending", "Instant delivery"],
  },
];

export const SUPPORT_AMOUNTS = [2, 5, 10, 20];

export const TRUST_ITEMS = [
  { icon: "↓", label: "Instant digital delivery" },
  { icon: "◎", label: "Secure payments" },
  { icon: "◈", label: "Designed by Elovayne" },
  { icon: "∞", label: "Personal use licence" },
  { icon: "♡", label: "Support available" },
];

export const ALL_SHOP_PRODUCTS: ShopProduct[] = [
  ...FEATURED_PRODUCTS,
  ...JOURNALS,
  ...WALLPAPERS,
  ...SOUNDSCAPES,
  ...PROFILE_THEMES,
  MEMBERSHIP_PRODUCT,
  ...GIFT_OPTIONS,
];

export function getProductById(id: string): ShopProduct | undefined {
  return ALL_SHOP_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): ShopProduct[] {
  if (category === "all") return ALL_SHOP_PRODUCTS;
  return ALL_SHOP_PRODUCTS.filter((p) => p.category === category);
}
