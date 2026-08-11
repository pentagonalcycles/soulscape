# Elovayne — Agent Instructions

## Project Overview

Elovayne is an immersive artistic community website. It's a dreamlike escape from reality where people share stories, emotions, and creative expressions.

**Core message:** "An artistic community where people escape everyday reality, express themselves, share their stories, and connect through meaningful creative experiences."

**Contributors:** Marco (founder), Tatiana Bianchi (primary developer)

---

## Design Language

**Visual theme:** Light, airy, teal/cyan aesthetic

### Colors
- Background: White (`#ffffff`), Gradient mint (`#f0fdf9`)
- Primary: Teal (`#0891b2`)
- Accent: Emerald (`#0d9488`), Cyan (`#06b6d4`), Green (`#10b981`)
- Text: Dark slate (`#0f172a`), Secondary (`#334155`), Muted (`#64748b`)

### Typography
- Headings: Cormorant Garamond (elegant, ethereal)
- Body: Inter (clean, readable)
- Accents: Caveat (handwritten feel)

### Animations
- **Always** use slow, breathing, organic motion
- Use `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for dream-like easing
- Animation speed controlled by `--anim-duration-multiplier` CSS variable

### Effects
- Glass morphism: `backdrop-filter: blur(12px)` with semi-transparent backgrounds
- Glow: `box-shadow` with teal/cyan hues
- Particles: Canvas-based starfield with mouse parallax
- Nebula: Animated radial gradients with blur
- Celestial borders: SVG moons, crystals, lotus flowers, filigree
- Cosmic gradients: Animated blurred gradient blobs

---

## Code Conventions

### File Structure
- Pages go in `src/app/` (App Router)
- Components go in `src/components/`
- Utilities go in `src/lib/`
- Database schema goes in `supabase/`

### Component Style
- Use `"use client"` directive for interactive components
- Use Framer Motion for all animations
- Use Tailwind CSS for styling
- Follow existing glass morphism patterns in `globals.css`

### Naming
- Components: PascalCase (`PostCard.tsx`)
- Pages: lowercase (`sanctuary/page.tsx`)
- Utilities: camelCase (`supabase.ts`)
- CSS classes: Tailwind utilities + custom classes from `globals.css`

### Supabase Client
- The Supabase client is exported as a **function** (`supabase()`) from `src/lib/supabase.ts`
- Always call it: `const client = supabase()` — never import as a static object
- This avoids SSR/browser API conflicts

---

## Emotional Rooms

Each room has its own atmosphere:

| Room | Colors | Particle Style |
|------|--------|----------------|
| Sanctuary | Purple/Violet | Cosmic, ethereal |
| Healing | Teal/Green | Slow, wave motion |
| Hope | Amber/Gold | Rising particles |
| Loneliness | Blue/Silver | Sparse, stillness |
| Grief | Purple/Gray | Slow, misty |
| Creativity | Multi-color | Dynamic, vibrant |
| Love | Pink/Warm | Floating orbs |
| Anxiety | Indigo/Blue | Subtle flicker |
| New Beginnings | Dawn colors | Rising particles |
| Self-Discovery | Kaleidoscope | Shifting patterns |
| Small Wins | Gold/Amber | Celebratory sparkle |
| Dreams | Indigo/Blue | Slow, drifting |
| Gratitude | Gold/Yellow | Warm, rising |
| Art & Poetry | Pink/Rose | Creative, flowing |
| A Place to Breathe | Teal/Cyan | Calm, minimal |

---

## Key Components

- `Starfield.tsx` — Canvas particle starfield (toggleable)
- `Nebula.tsx` — Animated nebula gradient blobs (intensity-aware)
- `GlowingPortal.tsx` — Breathing portal with exit transition
- `Navigation.tsx` — Shared navigation header (sidebar with 17+ feature links)
- `PostCreator.tsx` — Post creation with identity selector (text/poem/story/art) + room selector
- `PostCard.tsx` — Post display with 5 meaningful reactions, save, delete, report
- `SanctuaryFeed.tsx` — Feed component (Supabase-powered, includes community stats)
- `SanctuaryComposer.tsx` — Expandable whisper composer with mood selector, anonymous/named toggle, content warnings
- `WhisperCard.tsx` — Sanctuary post card with reactions, reply threads, content-warning blur
- `SaveButton.tsx` — Bookmark/save toggle on posts
- `LoadingSkeleton.tsx` — Animated loading placeholders for feeds
- `ElovayneLogo.tsx` — Logo image with glow animation (CSS mask + mix-blend-mode)
- `AuthProvider.tsx` — Auth (anonymous + email magic link) + user profile + preferences + admin check
- `ThemeContext.tsx` — Dynamic CSS variable theming based on user preferences
- `ClientLayout.tsx` — Client wrapper for AuthProvider + ThemeProvider + Footer + WelcomeModal
- `Footer.tsx` — Site-wide footer with links (About, Guidelines, Privacy, Crisis Support)
- `WelcomeModal.tsx` — First-time visitor onboarding with quick actions
- `CelestialBorder.tsx` — SVG decorative border with moons, crystals, lotus, filigree, stars
- `CosmicGradient.tsx` — Animated blurred gradient blobs (5 color sets)
- `ArtisticBackground.tsx` — Rich background with nebula orbs, constellations, particles, energy waves
- `ElyraChat.tsx` — AI companion chat with streaming SSE, mood detection, localStorage history
- `PremiumGate.tsx` — Glass-card overlay gating premium content behind Plus upgrade
- `PlusBadge.tsx` — Inline "PLUS" badge for premium features
- `ShopProductImage.tsx` — SVG animated product images for the shop
- `ServiceWorkerRegistration.tsx` — PWA service worker registration
- `CanvasToolbar.tsx` — Drawing tools for Dream Canvas (32 brush types)
- `DreamCanvas.tsx` — Browser-based drawing/painting app with export
- `campfire/` — Real-time anonymous group chat around virtual campfire
- `cosmic-camera/` — In-browser camera with 36 CSS filters and timer
- `dream-world/` — 2D tile-based sandbox with procedural generation and crafting
- `human-signal/` — Anonymous emotional signal connection system
- `human-weather/` — Collective emotion visualization as weather
- `ideas/` — Community feature-request voting board
- `mural/` — Real-time collaborative painting canvas
- `nebula-orb/` — Multiplayer cosmic arena game
- `nera/` — Anonymous story sharing with atmospheric backgrounds
- `poetry/` — Daily poetry composition with rotating prompts
- `reflection-room/` — Private journaling with daily prompts and streak tracking
- `soul-echo/` — Anonymous matching connecting two strangers
- `soul-map/` — Self-discovery mandala builder with daily questions
- `stargazing/` — Night sky with anonymous messages in stars
- `unseen/` — Anonymous human-connection with profile creation and reveal mechanics

---

## Meaningful Reactions

The 5 reactions (not "likes"):
1. 🤍 "I understand"
2. ✨ "This gave me hope"
3. 🫂 "I'm here with you"
4. 🌌 "Less alone"
5. 💫 "This comforted me"

---

## Supabase Integration

### Auth
- Anonymous auth via `supabase.auth.signInAnonymously()`
- Email magic link via `supabase.auth.signInWithOtp({ email })`
- User profile auto-created in `users` table on first visit
- `useAuth()` hook provides `userId`, `userProfile`, `userPreferences`, `refreshProfile()`, `updateProfile()`, `updatePreferences()`, `signInWithEmail()`, `signOut()`, `isAnonymous`

### Database Tables
- `rooms` — 15 emotional rooms (pre-populated)
- `users` — User profiles (anonymous/alias/real identity)
- `posts` — Content with types (text/poem/story/art/voice)
- `reactions` — 5 meaningful reaction types
- `saves` — Bookmarked posts
- `reports` — Content moderation (with reason: spam/inappropriate/harmful/other)
- `journals` — Private user journals (with mood tracking)
- `user_preferences` — UI personalization settings (colors, animations, layout, sound)
- `memberships` — Elovayne Plus membership status and plan
- `admin_users` — Admin role assignments

### RLS Policies
- Rooms: Anyone can view
- Posts: Anyone can read, only author can modify/delete
- Reactions: Anyone can read, one per user per post per type
- Users: Public read, insert allowed
- Saves: Private per user
- Journals: Private per user
- Reports: Reporter can read/insert, admin can update
- User preferences: Private per user

---

## Important Rules

1. **Never add public popularity metrics** — No follower counts, like counts, or engagement scores
2. **Always offer anonymous posting** — Users can post without revealing identity
3. **Keep it slow and dreamlike** — No fast, jarring animations
4. **Protect vulnerable users** — Strong moderation, reporting, and blocking
5. **Meaningful over viral** — Design for depth, not engagement
6. **Never commit secrets** — No API keys, passwords, or sensitive data in git

---

## Critical Deployment Notes

### Environment Variables
- `NEXT_PUBLIC_` variables are inlined at **build time** — changing them in the Vercel dashboard alone is not enough
- After changing env vars in Vercel, you **must trigger a redeploy**
- `NEXT_PUBLIC_SUPABASE_URL` must be the full URL: `https://<project-id>.supabase.co` (not just the project ID)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` must be the Supabase publishable key (starts with `sb_publishable_`)

### Supabase Client Pattern
- `supabase()` is exported as a **function** from `src/lib/supabase.ts`
- Always call it: `const client = supabase()` — never import as a static object
- This avoids SSR/browser API conflicts (Next.js App Router)
- The function returns a singleton browser client on the client side, and a fresh client on the server side

### Anonymous Auth (Required)
- In Supabase Dashboard → **Authentication → Providers** → enable **Anonymous** sign-in
- Without this, all auth fails with 422 and no session is created
- This must be enabled after recreating the database or resetting auth settings

---

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
vercel --prod    # Deploy to production
```

---

## Project Status

- **Phase 1:** ✅ Complete — Foundation (starfield, nebula, portal, homepage)
- **Phase 2:** ✅ Complete — Community Heart (posts, reactions, Supabase integration)
- **Phase 3:** ✅ Complete — Personal Space (profiles, saves, UI personalization)
- **Phase 4:** ✅ Complete — Polish & Launch (email auth, journals, sound, moderation, 404)
- **Phase 5:** ✅ Complete — Trust, Clarity & Engagement (about page, welcome modal, new rooms, footer, prompts, logo)
- **Phase 6:** ✅ Complete — Immersive Experiences (Dream Canvas, Dream World, Campfire, Cosmic Camera, Human Signal, Human Weather, Nebula Orb, Soul Echo, Soul Map, Unseen, Wish Lanterns, Elyra AI, Shop, Poetry, Mural, Stargazing, Nera, Ideas, Admin, FAQ, Support)
