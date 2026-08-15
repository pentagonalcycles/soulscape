# Environment Configuration

This document explains how to set up the Elovayne environment variables.

---

## Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

### Finding Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Project Settings** → **API**
4. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the **publishable** key (starts with `sb_publishable_`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## Optional Variables

### Elyra AI (OpenRouter)

```env
OPENROUTER_API_KEY=your_openrouter_key_here
```

Get an API key from [OpenRouter](https://openrouter.ai/). Without this, Elyra AI chat will use fallback responses.

### Stripe (Shop & Memberships)

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
```

Get these from [Stripe Dashboard](https://dashboard.stripe.com/). Without these, the shop and Plus membership features will not work.

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
| Project ID | `wfecrsaagihhhxsuvyyf` |
| Region | AWS (default) |
| Dashboard URL | https://app.supabase.com/project/wfecrsaagihhhxsuvyyf |

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
NEXT_PUBLIC_SUPABASE_URL=https://wfecrsaagihhhxsuvyyf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_actual_publishable_key
```

Optional:
```env
OPENROUTER_API_KEY=your_openrouter_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_MONTHLY_PRICE_ID=your_price_id
```

Never commit `.env.local` to git (it's in `.gitignore`).

---

## Troubleshooting

### "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"
- The `NEXT_PUBLIC_SUPABASE_URL` value must be the **full URL** including `https://` prefix
- Correct: `https://wfecrsaagihhhxsuvyyf.supabase.co`
- Wrong: `wfecrsaagihhhxsuvyyf` (just the project ID)
- After updating the Vercel env var, you **must redeploy** for changes to take effect
- `NEXT_PUBLIC_` variables are inlined at build time — changing them in the dashboard alone is not enough

### "Supabase URL is required" error
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local`
- Restart the dev server after changing env vars

### "Invalid API key" error
- Use the **publishable** key (starts with `sb_publishable_`), not any other key format

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

### Elyra AI not responding
- Ensure `OPENROUTER_API_KEY` is set in environment variables
- Check that the key is valid at [OpenRouter](https://openrouter.ai/keys)

### Shop/Stripe not working
- Ensure all Stripe environment variables are set
- For webhooks, configure the Stripe webhook endpoint in Stripe Dashboard → Developers → Webhooks
- Webhook URL: `https://elovayne.com/api/stripe/webhook`
