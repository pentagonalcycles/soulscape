# Environment Configuration

This document explains how to set up the Elovayne environment variables.

---

## Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_jwt_anon_key_here
```

### Finding Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Project Settings** → **API**
4. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the **anon public** key (starts with `eyJ...`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> **Important:** Use the `anon` key (JWT format), NOT the `publishable` key. The JavaScript client requires the JWT format to work correctly.

---

## Vercel Deployment

Environment variables are configured in the Vercel dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Project → Settings → Environment Variables
2. Add both variables for all environments (Production, Preview, Development)
3. Trigger a redeploy after setting them

---

## Supabase Project Details

| Property | Value |
|----------|-------|
| Project ID | `vqkvrdevzsfewexonjck` |
| Region | AWS (default) |
| Dashboard URL | https://app.supabase.com/project/vqkvrdevzsfewexonjck |

---

## Domain Configuration

| Domain | Provider | Status |
|--------|----------|--------|
| `elovayne.com` | Namecheap | ✅ Live |
| `www.elovayne.com` | Vercel | ✅ Live |

DNS Configuration (Namecheap):
- **A Record:** `@` → `76.76.21.21` (Vercel)
- **CNAME Record:** `www` → `cname.vercel-dns.com`

---

## Local Development

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vqkvrdevzsfewexonjck.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_jwt_anon_key
```

Never commit `.env.local` to git (it's in `.gitignore`).

---

## Troubleshooting

### "Supabase URL is required" error
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local`
- Restart the dev server after changing env vars

### "Invalid API key" error
- Use the **anon** key (JWT), not the **publishable** key
- The anon key starts with `eyJ` (it's a JWT)

### Posts not saving
- Check the Vercel function logs for errors
- Ensure RLS policies allow inserts (see `supabase/schema.sql`)
- The user must be authenticated (anonymous auth is automatic)

### Build fails with SSR error
- The Supabase client uses a function call pattern (`supabase()`) to avoid SSR/browser API conflicts
- Never import `supabase` directly as a static object — always call it as a function
