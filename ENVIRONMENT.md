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

### "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"
- The `NEXT_PUBLIC_SUPABASE_URL` value must be the **full URL** including `https://` prefix
- Correct: `https://vqkvrdevzsfewexonjck.supabase.co`
- Wrong: `vqkvrdevzsfewexonjck` (just the project ID)
- After updating the Vercel env var, you **must redeploy** for changes to take effect
- `NEXT_PUBLIC_` variables are inlined at build time — changing them in the dashboard alone is not enough

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

### Page loads but shows blank/black screen
- Open browser DevTools (F12) → Console tab to see the actual error
- The most common cause is an invalid or missing Supabase environment variable
- Verify the env var value in Vercel dashboard includes the full `https://` URL

### Settings/preferences buttons don't work
- Check browser console for "No session found when updating preferences"
- This means anonymous auth is failing — go to **Authentication → Providers** in Supabase dashboard
- Ensure **Anonymous** sign-in is enabled (ticked)
- If it was disabled, enable it and test again — no redeploy needed
