# Elovayne

An artistic community where people escape everyday reality, express themselves, share their stories, and connect through meaningful creative experiences.

![Elovayne](https://img.shields.io/badge/status-Phase%202%20Complete-6b3fa0?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-9d7cd8?style=for-the-badge)

---

## Overview

Elovayne is an immersive digital world designed as an escape from everyday reality. It's a place where people can explore creative experiences, express their emotions, share personal stories, and connect with others through meaningful interactions.

The website feels emotional, dreamlike, welcoming, mysterious, and visually artistic — like floating through a galaxy of human connection.

---

## Features

### Core Experience
- **Immersive Homepage** — Starfield particles, nebula gradients, and a glowing portal that draws you in
- **Community Sanctuary** — A safe space for sharing stories, emotions, and creative expressions
- **Emotional Rooms** — Themed spaces for Healing, Hope, Loneliness, Grief, Creativity, Love, Anxiety, New Beginnings, and Self-Discovery

### Meaningful Connections
- **5 Meaningful Reactions** — "I understand", "This gave me hope", "I'm here with you", "Less alone", "This comforted me"
- **Identity Options** — Post anonymously, with a creative alias, or your real identity
- **Content Types** — Share thoughts, poems, or stories

### Visual Design
- **Galaxy Aesthetic** — Deep space colors, nebula gradients, floating particles
- **Glass Morphism** — Translucent cards with backdrop blur
- **Breathing Animations** — Slow, organic motion throughout
- **Room-Specific Atmospheres** — Each emotional room has unique colors and particle styles

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Particles | Canvas (custom starfield) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Hosting | Vercel |
| Domain | elovayne.com |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/pentagonalcycles/soulscape.git
cd soulscape

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) for detailed instructions.

---

## Project Structure

```
soulscape/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css         # Design system & global styles
│   │   ├── layout.tsx          # Root layout with fonts
│   │   ├── page.tsx            # Immersive homepage
│   │   ├── sanctuary/          # Community sanctuary
│   │   └── rooms/              # Emotional rooms
│   │       ├── page.tsx        # Rooms grid
│   │       └── [slug]/         # Dynamic room pages
│   ├── components/             # React components
│   │   ├── Starfield.tsx       # Canvas particle starfield
│   │   ├── Nebula.tsx          # Animated nebula gradients
│   │   ├── ElovayneLogo.tsx    # Animated logo
│   │   ├── GlowingPortal.tsx   # Breathing portal
│   │   ├── PostCreator.tsx     # Post creation flow
│   │   ├── PostCard.tsx        # Post display + reactions
│   │   └── SanctuaryFeed.tsx   # Feed component
│   └── lib/                    # Utilities
│       └── supabase.ts         # Supabase client
├── supabase/
│   └── schema.sql              # Database schema
├── public/                     # Static assets
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

### Typography
- **Headings**: Cormorant Garamond — Elegant, ethereal serif
- **Body**: Inter — Clean, readable
- **Accents**: Caveat — Handwritten feel

### Animations
- **Breathe**: 3s ease-in-out infinite
- **Float**: 6s ease-in-out infinite
- **Drift**: 20s ease-in-out infinite
- **Portal Pulse**: 3s ease-in-out infinite

---

## Database Schema

The Supabase schema includes:

- **users** — User profiles with identity type (anonymous/alias/real)
- **posts** — Content with types (text/poem/story/art/voice)
- **rooms** — Emotional rooms with themes
- **reactions** — 5 meaningful reaction types
- **saves** — Bookmarked posts
- **reports** — Content moderation
- **journals** — Private user journals

See `supabase/schema.sql` for the full schema.

---

## Roadmap

### Phase 1 ✅ — Foundation
- [x] Next.js project setup
- [x] Design system (galaxy palette, typography, animations)
- [x] Immersive homepage with starfield, nebula, portal
- [x] Basic layout and navigation

### Phase 2 ✅ — Community Heart
- [x] Post creation flow with identity selector
- [x] Community sanctuary feed
- [x] 5 meaningful reactions system
- [x] Post types (text, poetry, stories)
- [x] Basic report/block functionality

### Phase 3 — Personal Space
- [ ] User accounts (Supabase Auth)
- [ ] Save/bookmark experiences
- [ ] Personal creative journal
- [ ] History of interactions

### Phase 4 — Polish & Launch
- [ ] Ambient sound options
- [ ] Performance optimization
- [ ] Moderation dashboard
- [ ] Launch publicly

### Future Phases
- [ ] Interactive art installations
- [ ] Sound/music experiences
- [ ] Voice recordings
- [ ] Photography/artwork galleries
- [ ] User-generated interactive content

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
