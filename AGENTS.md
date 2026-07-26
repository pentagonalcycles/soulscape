# Elovayne — Agent Instructions

## Project Overview

Elovayne is an immersive artistic community website. It's a dreamlike escape from reality where people share stories, emotions, and creative expressions.

**Core message:** "An artistic community where people escape everyday reality, express themselves, share their stories, and connect through meaningful creative experiences."

---

## Design Language

**Visual theme:** Galaxy / Dream aesthetic

### Colors
- Background: Deep space (`#050510`, `#0a0a2e`)
- Primary: Nebula purple (`#6b3fa0`)
- Accent: Violet (`#9d7cd8`), Cosmic pink (`#e879a8`), Gold (`#f5d062`)
- Text: Soft lavender white (`#e8e0f0`)

### Typography
- Headings: Cormorant Garamond (elegant, ethereal)
- Body: Inter (clean, readable)
- Accents: Caveat (handwritten feel)

### Animations
- **Always** use slow, breathing, organic motion
- Transitions should fade through dark (like between dream scenes)
- Never use snappy or abrupt animations
- Use `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for dream-like easing

### Effects
- Glass morphism: `backdrop-filter: blur(12px)` with semi-transparent backgrounds
- Glow: `box-shadow` and `text-shadow` with violet/purple hues
- Particles: Canvas-based starfield with mouse parallax
- Nebula: Animated radial gradients with blur

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
| Healing | Teal/Green | Slow, wave motion |
| Hope | Amber/Gold | Rising particles |
| Loneliness | Blue/Silver | Sparse, stillness |
| Grief | Purple/Gray | Slow, misty |
| Creativity | Multi-color | Dynamic, vibrant |
| Love | Pink/Warm | Floating orbs |
| Anxiety | Indigo/Blue | Subtle flicker |
| New Beginnings | Dawn colors | Rising particles |
| Self-Discovery | Kaleidoscope | Shifting patterns |

---

## Key Components

- `Starfield.tsx` — Canvas particle background with mouse parallax
- `Nebula.tsx` — Animated nebula gradient blobs
- `GlowingPortal.tsx` — Breathing portal with exit transition
- `PostCreator.tsx` — Post creation with identity selector
- `PostCard.tsx` — Post display with 5 meaningful reactions
- `SanctuaryFeed.tsx` — Feed component (Supabase-powered, uses `supabase()` function)
- `ElovayneLogo.tsx` — Animated logo
- `AuthProvider.tsx` — Anonymous auth + user profile creation (context provider)
- `ClientLayout.tsx` — Client wrapper for AuthProvider

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
- User profile auto-created in `users` table on first visit
- `useAuth()` hook provides `userId` and `ensureUserProfile()`

### Database Tables
- `rooms` — 10 emotional rooms (pre-populated)
- `users` — User profiles (anonymous/alias/real identity)
- `posts` — Content with types (text/poem/story)
- `reactions` — 5 meaningful reaction types
- `saves` — Bookmarked posts (Phase 3)
- `reports` — Content moderation
- `journals` — Private user journals (Phase 3)

### RLS Policies
- Rooms: Anyone can view
- Posts: Anyone can read, only author can modify
- Reactions: Anyone can read, one per user per post per type
- Users: Public read, insert allowed

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
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be the JWT-format anon key (starts with `eyJ`), not the publishable key

### Supabase Client Pattern
- `supabase()` is exported as a **function** from `src/lib/supabase.ts`
- Always call it: `const client = supabase()` — never import as a static object
- This avoids SSR/browser API conflicts (Next.js App Router)
- The function returns a singleton browser client on the client side, and a fresh client on the server side

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
- **Phase 3:** 🔄 In Progress — Personal Space (user profiles, bookmarks, journals)
- **Phase 4:** ⏳ Pending — Polish & Launch (sound, moderation, 404)
