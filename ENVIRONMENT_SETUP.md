# Environment Setup Guide

## Quick Start

This project uses **Next.js** and requires specific environment variables.

### 1. Create your environment file

Copy the example file:

```bash
cp .env.local.example .env.local
```

### 2. Add your credentials to `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google AI Configuration
GOOGLE_API_KEY=your-google-api-key-here
```

## Getting Your Credentials

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Project Settings** > **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Run the database schema:
   - Go to **SQL Editor** in your Supabase project
   - Copy the contents of `supabase/schema.sql`
   - Run it to create the tables

### Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key → `GOOGLE_API_KEY`

## Important Notes

 **Environment Variable Names Have Changed**

If you're migrating from the old Streamlit version:

| Old (Streamlit)     | New (Next.js)                      |
|---------------------|-------------------------------------|
| `SUPABASE_URL`      | `NEXT_PUBLIC_SUPABASE_URL`         |
| `SUPABASE_KEY`      | `NEXT_PUBLIC_SUPABASE_ANON_KEY`    |
| `GOOGLE_API_KEY`    | `GOOGLE_API_KEY` (same)            |

The `NEXT_PUBLIC_` prefix is required for Next.js to expose these variables to the browser.

## Verify Your Setup

Before running the app, verify your configuration:

```bash
# Run the setup verification script
pnpm check-setup
```

This will check:
- ✅ `.env.local` file exists
- ✅ All required environment variables are set
- ✅ No placeholder values remain
- ✅ Variable names are correct (not old Streamlit names)
- ✅ Dependencies are installed

Fix any ❌ errors or  warnings before proceeding.

## Running the Application

After setting up and verifying your `.env.local` file:

```bash
# Install dependencies (first time only)
pnpm install

# Verify setup (recommended)
pnpm check-setup

# Run development server
pnpm dev
```

The app will be available at `http://localhost:3000`

## Troubleshooting

### "Failed to create session" error

- Check that `.env.local` exists and has all required variables
- Verify your Supabase credentials are correct
- Ensure you've run the database schema (`supabase/schema.sql`)
- Restart your dev server after changing environment variables

### "Supabase not configured" error

- Ensure variable names start with `NEXT_PUBLIC_` for Supabase URLs and keys
- Check for typos in variable names
- Restart your development server

### Database errors

- Run `supabase/schema.sql` in your Supabase SQL Editor
- If you already have tables, run `supabase/migrations/002_session_metrics.sql` to add the metric columns
- Check that RLS policies are enabled and allow all operations

### Port already in use

If port 3000 is taken, start on a different port:

```bash
pnpm dev -- -p 3001
```

Then access at `http://localhost:3001`

