# Elovayne

An artistic community where people escape everyday reality, express themselves, share their stories, and connect through meaningful creative experiences.

![Elovayne](https://img.shields.io/badge/status-Phase%202%20Complete%20-%20Supabase%20Connected-6b3fa0?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-9d7cd8?style=for-the-badge)

**Live:** [elovayne.com](https://elovayne.com)

---

## Overview

Elovayne is an immersive digital world designed as an escape from everyday reality. It's a place where people can explore creative experiences, express their emotions, share personal stories, and connect with others through meaningful interactions.

The website feels emotional, dreamlike, welcoming, mysterious, and visually artistic — like floating through a galaxy of human connection.

---

## Features

### Core Experience
- **Immersive Homepage** — Canvas starfield particles with mouse parallax, animated nebula gradient blobs, glowing portal with breathing animation and exit transition
- **Community Sanctuary** — A safe space for sharing stories, emotions, and creative expressions. Posts are saved to Supabase and persist across sessions.
- **Emotional Rooms** — Themed spaces for Healing, Hope, Loneliness, Grief, Creativity, Love, Anxiety, New Beginnings, and Self-Discovery — each with unique color atmospheres

### Meaningful Connections
- **5 Meaningful Reactions** — "I understand", "This gave me hope", "I'm here with you", "Less alone", "This comforted me" — saved to database, toggleable
- **Identity Options** — Post anonymously, with a creative alias, or your real identity
- **Content Types** — Share thoughts, poems, or stories

### Visual Design
- **Galaxy Aesthetic** — Deep space colors, nebula gradients, floating particles
- **Glass Morphism** — Translucent cards with backdrop blur
- **Breathing Animations** — Slow, organic motion throughout
- **Room-Specific Atmospheres** — Each emotional room has unique colors and particle styles

### Backend
- **Supabase** — PostgreSQL database, anonymous authentication, Row Level Security
- **Real-time Data** — Posts and reactions stored and fetched from Supabase
- **Anonymous Auth** — Every visitor gets a unique user ID without signing up

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion + CSS keyframes |
| Particles | Canvas-based custom starfield |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (anonymous) |
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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_jwt_anon_key_here
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) for detailed setup instructions.

---

## Project Structure

```
soulscape/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── globals.css               # Design system & global styles
│   │   ├── layout.tsx                # Root layout with fonts + AuthProvider
│   │   ├── page.tsx                  # Immersive homepage with portal
│   │   ├── sanctuary/page.tsx        # Community sanctuary with feed
│   │   ├── profile/page.tsx          # User profile (edit identity, bio, contact)
│   │   ├── settings/page.tsx         # UI personalization controls
│   │   ├── saves/page.tsx            # Bookmarked/saved posts
│   │   └── rooms/
│   │       ├── page.tsx              # Rooms grid
│   │       └── [slug]/page.tsx       # Dynamic room pages with room-specific nebula
│   ├── components/
│   │   ├── Starfield.tsx             # Canvas particle starfield (toggleable)
│   │   ├── Nebula.tsx                # Animated nebula (intensity-aware)
│   │   ├── ElovayneLogo.tsx          # Animated SVG logo with glow
│   │   ├── GlowingPortal.tsx         # Breathing portal with exit transition
│   │   ├── PostCreator.tsx           # Post creation with identity selector
│   │   ├── PostCard.tsx              # Post display with reactions + save button
│   │   ├── SanctuaryFeed.tsx         # Feed component (Supabase-powered)
│   │   ├── SaveButton.tsx            # Bookmark/save toggle on posts
│   │   ├── AuthProvider.tsx           # Anonymous auth + profile + preferences
│   │   ├── ThemeContext.tsx           # Dynamic CSS variable theming
│   │   └── ClientLayout.tsx          # Client-side layout wrapper
│   └── lib/
│       └── supabase.ts               # Supabase client (SSR-safe)
├── supabase/
│   ├── schema.sql                    # Full database schema with RLS
│   └── migration_phase3.sql          # Phase 3 migration (run in SQL Editor)
├── public/                           # Static assets
├── ENVIRONMENT.md                    # Environment setup guide
├── AGENTS.md                         # AI agent instructions
└── package.json
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
| `rooms` | 10 emotional rooms with themes and ambient settings |
| `users` | User profiles (identity, bio, contact details) |
| `posts` | Content with types (text/poem/story/art/voice) |
| `reactions` | 5 meaningful reaction types per user per post |
| `saves` | Bookmarked posts |
| `reports` | Content moderation |
| `journals` | Private user journals |
| `user_preferences` | UI personalization (colors, animations, layout) |

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

### Phase 4 — Polish & Launch
- [ ] User accounts with email (upgrade from anonymous)
- [ ] Personal creative journal
- [ ] Ambient sound options per room
- [ ] Performance optimization
- [ ] Moderation dashboard
- [ ] Custom 404 page

### Future Phases
- [ ] Interactive art installations
- [ ] Sound/music experiences
- [ ] Voice recordings
- [ ] Photography/artwork galleries
- [ ] User-generated interactive content
- [ ] Real-time posts via Supabase subscriptions

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
