# Quick Fix: "Failed to create session" Error

## What's Wrong?

You're getting a **500 Internal Server Error** because your environment variables aren't configured correctly.

## Quick Fix (5 minutes)

### Step 1: Create .env.local file

In your project root (same folder as `package.json`), create a file named `.env.local`:

```bash
# On Mac/Linux:
touch .env.local

# On Windows:
type nul > .env.local
```

### Step 2: Add your credentials

Open `.env.local` in your text editor and paste this (with YOUR actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GOOGLE_API_KEY=your-google-api-key-here
```

**Where to get these values:**

1. **Supabase URL & Key:**
   - Go to [supabase.com](https://supabase.com)
   - Open your project → Settings → API
   - Copy "Project URL" and "anon/public key"

2. **Google AI Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the key

### Step 3: Setup database (if you haven't already)

1. In Supabase, go to **SQL Editor**
2. Copy everything from `supabase/schema.sql` (in this project)
3. Paste and click **Run**

### Step 4: Restart your dev server

```bash
# Stop the server (Ctrl+C if running)

# Restart it
pnpm dev
```

### Step 5: Test it

1. Open http://localhost:3000
2. Click "New Chat"
3. It should work! ✅

## Verify Your Setup

Run this to check if everything is configured:

```bash
pnpm check-setup
```

Fix any errors shown, then try again.

## Still Not Working?

### Check the Server Console

Look at your terminal where `pnpm dev` is running. You'll see helpful error messages like:

```
❌ Supabase environment variables not configured
💡 Run the SQL in supabase/schema.sql to create the tables
```

Follow the suggestions marked with 💡

### Read the Full Guides

- **Setup Instructions:** [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Complete Fix Info:** [FIX_SUMMARY.md](FIX_SUMMARY.md)

## Common Mistakes

❌ **Wrong variable names:**
```env
# DON'T use these old names:
SUPABASE_URL=...
SUPABASE_KEY=...
```

✅ **Use these names:**
```env
# DO use these new names:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

❌ **File in wrong location:**
- File must be in project root (next to `package.json`)
- NOT in `app/`, `lib/`, or any subfolder

✅ **Correct location:**
```
digital-footprints/
├── .env.local          ← HERE!
├── package.json
├── app/
└── ...
```

❌ **Forgot to restart server:**
- Environment variables only load when the server starts
- You MUST restart after changing `.env.local`

✅ **Always restart:**
```bash
# Ctrl+C to stop, then:
pnpm dev
```

## That's It!

If you followed these steps, your app should work now. If not, check the detailed guides linked above.

---

**Need help?** The error messages in your console will tell you exactly what's wrong. Look for lines starting with ❌ and follow the suggestions marked with 💡



