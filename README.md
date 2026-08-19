# Elovayne

An artistic community where people escape everyday reality, express themselves, share their stories, and connect through meaningful creative experiences.

![Elovayne](https://img.shields.io/badge/status-Phase%206%20Complete%20-%20Full%20Platform-0891b2?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-0d9488?style=for-the-badge)

**Live:** [elovayne.com](https://elovayne.com)

---

## Overview

Elovayne is an immersive digital world designed as an escape from everyday reality. It's a place where people can explore creative experiences, express their emotions, share personal stories, and connect with others through meaningful interactions.

The website feels emotional, dreamlike, welcoming, mysterious, and visually artistic — like floating through a galaxy of human connection.

---

## Features

### Core Experience
- **Immersive Homepage** — Animated gradient background, cosmic gradient blobs, glowing portal with breathing animation, starfield particles, and descriptive subtitle
- **Emotional Rooms** — 15 themed spaces including Healing, Hope, Loneliness, Grief, Creativity, Love, Anxiety, New Beginnings, Self-Discovery, Small Wins, Dreams, Gratitude, Art & Poetry, and A Place to Breathe — each with unique color atmospheres and ambient sound

### Meaningful Connections
- **5 Meaningful Reactions** — "I understand", "This gave me hope", "I'm here with you", "Less alone", "This comforted me" — saved to database, toggleable
- **Identity Options** — Post anonymously, with a creative alias, or your real identity
- **Content Types** — Share thoughts, poems, stories, or artwork
- **Room Selector** — Choose which room to post to when creating content

### Personal Space
- **User Profiles** — Control your identity, bio, and optional contact details
- **Save/Bookmark** — Save meaningful posts to revisit later
- **Personal Journal** — Private creative journal with mood tracking
- **UI Personalization** — Accent color, starfield, nebula intensity, animation speed, compact mode
- **Account Dashboard** — View membership status, purchases, and downloads

### Safety & Moderation
- **Report System** — Report posts with reason selection (Spam, Inappropriate, Harmful, Other)
- **Moderation Dashboard** — Review, dismiss, or remove reported posts
- **Post Deletion** — Authors can delete their own posts
- **Anonymous by Default** — No identity required to participate

### Trust & Clarity
- **Welcome Modal** — First-time visitor onboarding with quick actions
- **About Page** — Privacy, community guidelines, safety info, and crisis support
- **Privacy Nudge** — Reassurance in post creator that identity is always protected
- **Footer** — Persistent links to About, Guidelines, Privacy, and Crisis Support
- **FAQ** — Comprehensive frequently asked questions
- **Support Page** — Crisis resources and help links

### Authentication
- **Anonymous Auth** — Every visitor gets a unique user ID automatically
- **Email Magic Link** — Upgrade to a permanent account with passwordless sign-in
- **Persistent Data** — Saved posts, journal entries, and preferences persist across sessions

### Immersive Experiences
- **Dream Canvas** — Browser-based drawing/painting app with 32 brush types, symmetry, layers, and PNG/JPEG/WebP export
- **Dream World** — 2D tile-based sandbox game with procedurally generated worlds, crafting, day/night cycle, and weather
- **Campfire** — Real-time anonymous group chat around a virtual campfire with ambient fire sounds
- **Cosmic Camera** — In-browser camera with 36 CSS filter presets, timer, grid overlay, and in-session gallery
- **Mural** — Real-time collaborative painting canvas where multiple users create art together
- **Poetry** — Daily poetry composition with rotating prompts, pen names, and poetic reactions
- **Wish Lanterns** — Release animated lanterns into a night sky; click to read others' wishes
- **Soul Map** — Self-discovery tool with daily questions that build a personal mandala over time
- **Reflection Room** — Private journaling space with daily prompts and streak tracking
- **Human Signal** — Send anonymous emotional signals and be reached by another person
- **Nebula Orb** — Multiplayer cosmic arena game; consume orbs, compete on leaderboards
- **Ideas** — Community feature-request board with voting

### AI Companion
- **Elyra** — AI companion chat with streaming responses, mood detection, customizable personality, and chat history

### Visual Design
- **Light Aesthetic** — White/mint backgrounds, teal/cyan accents, soft gradients
- **Glass Morphism** — Translucent cards with backdrop blur
- **Breathing Animations** — Slow, organic motion throughout
- **Room-Specific Atmospheres** — Each emotional room has unique colors, particles, and ambient sound
- **Celestial Borders** — SVG decorative borders with moons, crystals, lotus flowers
- **Cosmic Gradients** — Animated blurred gradient blobs
- **Artistic Backgrounds** — Nebula orbs, constellations, floating particles, energy waves

### Backend
- **Supabase** — PostgreSQL database, anonymous + email authentication, Row Level Security
- **Real-time Data** — Posts, reactions, and multiplayer features via Supabase channels
- **Row Level Security** — Privacy enforced at the database level
- **Offline Support** — IndexedDB for offline journal entries with sync queue
- **PWA** — Service worker registration for offline capabilities

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion + CSS keyframes |
| Particles | Canvas-based custom starfield |
| Audio | Web Audio API (procedural ambient tones) |
| Maps | Leaflet + React-Leaflet |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (anonymous + email magic link) |
| AI | OpenRouter API (Elyra chat) |
| Payments | Stripe (checkout, webhooks, subscriptions) |
| Hosting | Vercel |
| Domain | elovayne.com |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- A Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/pentagonalcycles/soulscape.git
cd soulscape

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials (see ENVIRONMENT.md)

# Run the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

Optional (for Elyra AI):
```env
OPENROUTER_API_KEY=your_openrouter_key_here
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) for detailed setup instructions.

---

## Project Structure

```
soulscape/
├ src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── globals.css               # Design system & global styles
│   │   ├── layout.tsx                # Root layout with fonts + AuthProvider
│   │   ├── page.tsx                  # Immersive homepage with portal
│   │   ├── not-found.tsx             # Custom 404 page
│   │   ├── error.tsx                 # Error boundary
│   │   ├── about/page.tsx            # About, privacy, guidelines, safety
│   │   ├── account/page.tsx          # Account dashboard (purchases, membership)
│   │   ├── admin/page.tsx            # Admin dashboard (reports, users, content)
│   │   ├── camera/page.tsx           # Cosmic Camera with filters
│   │   ├── campfire/page.tsx         # Group chat experience
│   │   ├── dream-canvas/page.tsx     # Drawing/painting app
│   │   ├── dream-world/page.tsx      # Sandbox building game
│   │   ├── elyra/page.tsx            # AI companion chat
│   │   ├── faq/page.tsx              # Frequently asked questions
│   │   ├── human-signal/page.tsx     # Anonymous signal connection
│   │   ├── ideas/page.tsx            # Community feature voting
│   │   ├── moderation/page.tsx       # Moderation dashboard
│   │   ├── mural/page.tsx            # Collaborative painting canvas
│   │   ├── nebula-orb/page.tsx       # Multiplayer arena game
│   │   ├── poetry/page.tsx           # Daily poetry composition
│   │   ├── reflection-room/page.tsx  # Private journaling with prompts
│   │   ├── shop/                     # E-commerce storefront
│   │   │   ├── page.tsx              # Shop catalog
│   │   │   └── [id]/page.tsx         # Product detail
│   │   ├── soul-map/page.tsx         # Self-discovery mandala
│   │   ├── stargazing/page.tsx       # Night sky messages
│   │   ├── support/page.tsx          # Crisis resources & help
│   │   ├── unseen/page.tsx           # Anonymous connection/dating
│   │   ├── wish-lanterns/page.tsx    # Interactive lantern canvas
│   │   └── api/                      # API routes
│   │       ├── admin/                # Admin endpoints
│   │       ├── elyra/chat/route.ts   # AI chat streaming
│   │       └── download/             # File downloads
│   ├── components/
│   │   ├── Starfield.tsx             # Canvas particle starfield (toggleable)
│   │   ├── Nebula.tsx                # Animated nebula (intensity-aware)
│   │   ├── ElovayneLogo.tsx          # Logo image with glow animation
│   │   ├── GlowingPortal.tsx         # Breathing portal with exit transition
│   │   ├── Navigation.tsx            # Shared navigation header (sidebar)
│   │   ├── Footer.tsx                # Site-wide footer with links
│   │   ├── WelcomeModal.tsx          # First-time visitor onboarding
│   │   ├── PostCreator.tsx           # Post creation with identity + room selector
│   │   ├── PostCard.tsx              # Post display with reactions + save + delete
│   │   ├── SaveButton.tsx            # Bookmark/save toggle on posts
│   │   ├── LoadingSkeleton.tsx       # Animated loading placeholders
│   │   ├── AuthProvider.tsx           # Auth (anonymous + email) + profile + preferences
│   │   ├── ThemeContext.tsx           # Dynamic CSS variable theming
│   │   ├── ClientLayout.tsx          # Client-side layout wrapper
│   │   ├── CelestialBorder.tsx       # SVG decorative border
│   │   ├── CosmicGradient.tsx         # Animated gradient blobs
│   │   ├── ArtisticBackground.tsx    # Rich background with orbs, constellations
│   │   ├── ElyraChat.tsx             # AI companion chat with streaming
│   │   ├── ElyraButton.tsx           # AI chat trigger button
│   │   ├── PremiumGate.tsx           # Premium content gating
│   │   ├── PlusBadge.tsx             # Premium badge indicator
│   │   ├── ServiceWorkerRegistration.tsx # PWA service worker
│   │   ├── CanvasToolbar.tsx         # Drawing tools for Dream Canvas
│   │   ├── DreamCanvas.tsx           # Browser-based drawing app
│   │   ├── campfire/                 # Campfire group chat
│   │   ├── cosmic-camera/            # Camera with filters
│   │   ├── dream-world/              # Sandbox game components
│   │   ├── human-signal/             # Signal connection
│   │   ├── ideas/                    # Feature voting
│   │   ├── mural/                    # Collaborative canvas
│   │   ├── nebula-orb/               # Arena game
│   │   ├── poetry/                   # Poetry composition
│   │   ├── reflection-room/          # Journaling
│   │   ├── soul-map/                 # Mandala builder
│   │   └── unseen/                   # Anonymous connection
│   ├── hooks/
│   │   ├── useCamera.ts              # Camera access hook
│   │   └── useMotionDetection.ts     # Motion detection hook
│   └── lib/
│       ├── supabase.ts               # Supabase client (SSR-safe)
│       ├── offline-db.ts             # IndexedDB offline storage
│       ├── sync-queue.ts             # Offline sync processor
│       ├── campfire/                 # Campfire multiplayer logic
│       ├── dream-world/              # Game engine (world gen, blocks, AI)
│       ├── mural/                    # Mural brushes & multiplayer
│       ├── nebula-orb/               # Game engine (renderer, physics)
│       ├── poetry/                   # Poetry prompts
│       ├── soul-map/                 # Self-discovery questions
│       ├── sound/                    # Audio engine
│       └── unseen/                   # Connection logic
├ supabase/
│   ├── schema.sql                    # Full database schema with RLS
│   ├── migration_phase3.sql          # Phase 3 migration
│   ├── migration_phase4.sql          # Phase 4 migration (sound preferences)
│   ├── migration_new_rooms.sql       # New positive rooms migration
│   ├── migration_admin_enhancements.sql
│   ├── migration_campfire.sql
│   ├── migration_human_signal.sql
│   ├── migration_ideas.sql
│   ├── migration_mural.sql
│   ├── migration_poems.sql
│   ├── migration_stargazing.sql
│   ├── migration_unseen.sql
│   └── migration_wish_lanterns.sql
├ public/
│   ├── logo.jpeg                     # Elovayne logo
│   └── ...
├ ENVIRONMENT.md                    # Environment setup guide
├ AGENTS.md                         # AI agent instructions
└ package.json
```

---

## Design System

### Color Palette
- **Void**: `#ffffff` — Background
- **Gradient**: `#f0fdf9` — Gradient mint
- **Deep**: `#e6f7f2` — Cards
- **Nebula**: `#0891b2` — Primary (teal)
- **Violet**: `#0d9488` — Accent (emerald)
- **Cosmic Pink**: `#06b6d4` — Highlight (cyan)
- **Gold**: `#10b981` — Warm accent (green)
- **Light**: `#0f172a` — Text (dark slate)
- **Muted**: `#155e75` — Secondary text
- **Dim**: `#5eead4` — Tertiary text

### Typography
- **Headings**: Cormorant Garamond — Elegant, ethereal serif
- **Body**: Inter — Clean, readable
- **Accents**: Caveat — Handwritten feel

### CSS Classes
All Tailwind color classes use the `elovayne-*` prefix:
- `bg-elovayne-void`, `text-elovayne-light`, `border-elovayne-violet`, etc.
- `glass` — Glass morphism card style
- `glow-text` / `glow-text-strong` — Glow text effects

---

## Database Schema

The Supabase database includes:

| Table | Description |
|-------|-------------|
| `rooms` | 15 emotional rooms with themes and ambient settings |
| `users` | User profiles (identity, bio, contact details) |
| `posts` | Content with types (text/poem/story/art/voice) |
| `reactions` | 5 meaningful reaction types per user per post |
| `saves` | Bookmarked posts |
| `reports` | Content moderation |
| `journals` | Private user journals |
| `user_preferences` | UI personalization (colors, animations, layout, sound) |
| `memberships` | Elovayne Plus membership status and plan |
| `admin_users` | Admin role assignments |

Row Level Security (RLS) is enabled on all tables with appropriate policies.

See `supabase/schema.sql` for the full schema.

---

## Roadmap

### Phase 1 ✅ — Foundation
- [x] Next.js project setup with Tailwind + Framer Motion
- [x] Design system (galaxy palette, typography, animations)
- [x] Immersive homepage with starfield, nebula, portal
- [x] Basic layout and navigation

### Phase 2 ✅ — Community Heart
- [x] Post creation flow with identity selector (anonymous/alias/real)
- [x] 5 meaningful reactions system (database-backed)
- [x] Post types (text, poetry, stories)
- [x] Basic report functionality
- [x] Supabase integration (anonymous auth, database, RLS)
- [x] Domain: elovayne.com

### Phase 3 ✅ — Personal Space
- [x] User profile page (identity, bio, optional contact details)
- [x] Save/bookmark posts
- [x] UI personalization (accent color, starfield, nebula, animation speed, compact mode)
- [x] Dynamic theme system (CSS variable injection)
- [x] User preferences persistence via Supabase

### Phase 4 ✅ — Polish & Launch
- [x] User accounts with email (magic link upgrade from anonymous)
- [x] Personal creative journal (CRUD + mood tracking)
- [x] Ambient sound options per room (Web Audio API)
- [x] Performance optimization (shared navigation, loading skeletons)
- [x] Moderation dashboard (review/dismiss/remove reported posts)
- [x] Custom 404 page
- [x] Post deletion by author
- [x] Report system with reason selection
- [x] Art content type (voice coming soon)
- [x] Room-specific feeds (each room shows only its posts)

### Phase 5 ✅ — Trust, Clarity & Engagement
- [x] Homepage clarity (descriptive subtitle + "How it works" link)
- [x] About page (privacy, guidelines, safety, crisis support)
- [x] Welcome modal for first-time visitors
- [x] Privacy nudge in post creator
- [x] 5 new positive rooms (Small Wins, Dreams, Gratitude, Art & Poetry, Breathe)
- [x] Community stats (total stories + reactions)
- [x] Room selector in post creator
- [x] Site-wide footer with links
- [x] Custom logo image

### Phase 6 ✅ — Immersive Experiences
- [x] Dream Canvas (browser drawing/painting with 32 brushes)
- [x] Dream World (sandbox building game)
- [x] Campfire (real-time group chat)
- [x] Cosmic Camera (filters, timer, gallery)
- [x] Mural (collaborative painting)
- [x] Poetry (daily prompts, pen names)
- [x] Wish Lanterns (interactive sky canvas)
- [x] Soul Map (mandala self-discovery)
- [x] Reflection Room (private journaling)
- [x] Human Signal (anonymous connection)
- [x] Nebula Orb (multiplayer arena game)
- [x] Ideas (community feature voting)
- [x] Elyra AI companion (streaming chat)
- [x] Admin dashboard (reports, users, content, products)
- [x] FAQ page
- [x] Support page (crisis resources)
- [x] Account dashboard (purchases, downloads)
- [x] Offline support (IndexedDB + sync queue)
- [x] PWA service worker

### Future Phases
- [ ] Voice recordings
- [ ] Photography/artwork galleries
- [ ] User-generated interactive content
- [ ] Real-time posts via Supabase subscriptions
- [ ] Interactive art installations

---

## Contributing

Contributors:
- **Marco** — Founder
- **Tatiana Bianchi** — Primary developer

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

## Acknowledgments

Built with love for those who need an escape, a voice, and a community that understands.

*"An artistic community where people escape everyday reality, express themselves, share their stories, and connect through meaningful creative experiences."*
