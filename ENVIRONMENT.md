# Environment Variables

This document explains how to set up environment variables for Elovayne.

---

## Required Variables

### Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to find these:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

---

## Setup Instructions

### 1. Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a project name (e.g., `elovayne`)
4. Set a database password
5. Select a region close to your users
6. Click "Create new project"

### 2. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste the contents of `supabase/schema.sql`
4. Click "Run"

### 3. Get API Credentials

1. Go to **Settings** → **API**
2. Copy the **Project URL**
3. Copy the **anon public** key

### 4. Create Environment File

```bash
# In the project root
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Restart Development Server

```bash
npm run dev
```

---

## Vercel Deployment

When deploying to Vercel:

1. Go to your project on [vercel.com](https://vercel.com)
2. Go to **Settings** → **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Set the environment to **Production** (and **Preview** if needed)
5. Redeploy the project

---

## Security Notes

- Never commit `.env.local` to git
- The `NEXT_PUBLIC_` prefix makes variables available in the browser (required for Supabase client)
- The anon key is safe to expose — Row Level Security (RLS) protects your data
- Never expose your `service_role` key in client-side code

---

## Troubleshooting

### "Invalid API key" error
- Check that your `.env.local` file exists and has the correct values
- Restart the development server after changing environment variables

### Supabase connection failed
- Verify your project URL is correct
- Check that your Supabase project is not paused (free tier pauses after inactivity)

### Build fails on Vercel
- Ensure environment variables are added in Vercel dashboard
- Check build logs for missing variable errors
