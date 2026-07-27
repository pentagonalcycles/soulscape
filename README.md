# Elovayne

An artistic community where people escape everyday reality, express themselves, share their stories, and connect through meaningful creative experiences.

![Elovayne](https://img.shields.io/badge/status-Phase%204%20Complete%20-%20Launch%20Ready-6b3fa0?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-9d7cd8?style=for-the-badge)

**Live:** [elovayne.com](https://elovayne.com)

---

## Overview

Elovayne is an immersive digital world designed as an escape from everyday reality. It's a place where people can explore creative experiences, express their emotions, share personal stories, and connect with others through meaningful interactions.

The website feels emotional, dreamlike, welcoming, mysterious, and visually artistic — like floating through a galaxy of human connection.

---

## Features

### Core Experience
- **Immersive Homepage** — Canvas starfield particles with mouse parallax, animated nebula gradient blobs, glowing portal with breathing animation and exit transition, descriptive subtitle, and "How it works" link
- **Community Sanctuary** — A safe space for sharing stories, emotions, and creative expressions. Posts are saved to Supabase and persist across sessions. Daily emotional prompts and community stats.
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

### Authentication
- **Anonymous Auth** — Every visitor gets a unique user ID automatically
- **Email Magic Link** — Upgrade to a permanent account with passwordless sign-in
- **Persistent Data** — Saved posts, journal entries, and preferences persist across sessions

### Visual Design
- **Galaxy Aesthetic** — Deep space colors, nebula gradients, floating particles
- **Glass Morphism** — Translucent cards with backdrop blur
- **Breathing Animations** — Slow, organic motion throughout
- **Room-Specific Atmospheres** — Each emotional room has unique colors, particles, and ambient sound
- **Ambient Sound** — Procedural Web Audio API tones unique to each room

### Backend
- **Supabase** — PostgreSQL database, anonymous + email authentication, Row Level Security
- **Real-time Data** — Posts and reactions stored and fetched from Supabase
- **Row Level Security** — Privacy enforced at the database level

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion + CSS keyframes |
| Particles | Canvas-based custom starfield |
| Audio | Web Audio API (procedural ambient tones) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (anonymous + email magic link) |
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
│   │   ├── about/page.tsx            # About, privacy, guidelines, safety
│   │   ├── sanctuary/page.tsx        # Community sanctuary with feed + daily prompt
│   │   ├── profile/page.tsx          # User profile (edit identity, bio, contact)
│   │   ├── settings/page.tsx         # UI personalization controls
│   │   ├── saves/page.tsx            # Bookmarked/saved posts
│   │   ├── journal/page.tsx          # Personal creative journal
│   │   ├── login/page.tsx            # Email magic link authentication
│   │   ├── moderation/page.tsx       # Moderation dashboard
│   │   └── rooms/
│   │       ├── page.tsx              # Rooms grid (15 rooms)
│   │       └── [slug]/page.tsx       # Dynamic room pages with room-specific nebula + sound
│   ├── components/
│   │   ├── Starfield.tsx             # Canvas particle starfield (toggleable)
│   │   ├── Nebula.tsx                # Animated nebula (intensity-aware)
│   │   ├── ElovayneLogo.tsx          # Logo image with glow animation
│   │   ├── GlowingPortal.tsx         # Breathing portal with exit transition
│   │   ├── Navigation.tsx            # Shared navigation header
│   │   ├── Footer.tsx                # Site-wide footer with links
│   │   ├── WelcomeModal.tsx          # First-time visitor onboarding
│   │   ├── PostCreator.tsx           # Post creation with identity + room selector
│   │   ├── PostCard.tsx              # Post display with reactions + save + delete
│   │   ├── SanctuaryFeed.tsx         # Feed component (Supabase-powered, with stats)
│   │   ├── SaveButton.tsx            # Bookmark/save toggle on posts
│   │   ├── LoadingSkeleton.tsx       # Animated loading placeholders
│   │   ├── AmbientSound.tsx          # Web Audio API ambient tones per room
│   │   ├── AuthProvider.tsx           # Auth (anonymous + email) + profile + preferences
│   │   ├── ThemeContext.tsx           # Dynamic CSS variable theming
│   │   └── ClientLayout.tsx          # Client-side layout wrapper + Footer + WelcomeModal
│   └── lib/
│       └── supabase.ts               # Supabase client (SSR-safe)
├ supabase/
│   ├── schema.sql                    # Full database schema with RLS
│   ├── migration_phase3.sql          # Phase 3 migration
│   ├── migration_phase4.sql          # Phase 4 migration (sound preferences)
│   └── migration_new_rooms.sql       # New positive rooms migration
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
- **Void**: `#050510` — Background
- **Deep**: `#0a0a2e` — Cards
- **Nebula**: `#6b3fa0` — Primary
- **Violet**: `#9d7cd8` — Accent
- **Cosmic Pink**: `#e879a8` — Highlight
- **Gold**: `#f5d062` — Warm accent
- **Light**: `#e8e0f0` — Text
- **Muted**: `#a89cc8` — Secondary text
- **Dim**: `#6b5f8a` — Tertiary text

### Typography
- **Headings**: Cormorant Garamond — Elegant, ethereal serif
- **Body**: Inter — Clean, readable
- **Accents**: Caveat — Handwritten feel

### CSS Classes
All Tailwind color classes use the `elovayne-*` prefix:
- `bg-elovayne-void`, `text-elovayne-light`, `border-elovayne-violet`, etc.
- `glass` — Glass morphism card style
- `glow-text` / `glow-text-strong` — Neon glow text effects

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
- [x] Community sanctuary feed (Supabase-powered)
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
- [x] Daily emotional prompts in sanctuary
- [x] Community stats (total stories + reactions)
- [x] Room selector in post creator
- [x] Site-wide footer with links
- [x] Custom logo image

### Future Phases
- [ ] Voice recordings
- [ ] Photography/artwork galleries
- [ ] User-generated interactive content
- [ ] Real-time posts via Supabase subscriptions
- [ ] Interactive art installations

---

## Contributing

This is currently a solo project. Contributions may be opened in the future.

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

## Acknowledgments

Built with love for those who need an escape, a voice, and a community that understands.

*"An artistic community where people escape everyday reality, express themselves, share their stories, and connect through meaningful creative experiences."*
