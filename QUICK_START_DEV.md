# Quick Start for Development

## You're seeing errors? Here's the fix! 🔧

### Issue 1: CSS Not Working

**Missing:** `postcss.config.js`

**Fixed!** ✅ The file has been created. Restart your dev server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Issue 2: API 500 Error

**Missing:** Environment variables

**Fix:** Create `.env.local` file in the project root:

```bash
# Copy the example
cp .env.local.example .env.local
```

Then edit `.env.local` and add your actual keys:

```env
GOOGLE_API_KEY=your_actual_google_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### Getting API Keys

#### 1. Google Gemini AI API Key (Free)

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste into `.env.local` as `GOOGLE_API_KEY`

#### 2. Supabase (Free Tier)

1. Go to https://supabase.com
2. Create a new project (takes ~2 minutes)
3. Go to Settings → API
4. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Go to SQL Editor
6. Copy contents of `supabase/schema.sql`
7. Paste and run in SQL Editor

### After Setting Up Environment Variables

1. **Restart the dev server:**
```bash
# Stop (Ctrl+C) then restart
npm run dev
```

2. **Refresh your browser**

The app should now work! 🎉

## Full Setup Checklist

- [ ] `postcss.config.js` exists (already done ✅)
- [ ] `.env.local` created with real API keys
- [ ] Supabase database schema executed
- [ ] Dev server restarted
- [ ] Browser refreshed

## Still Having Issues?

### Clear Next.js Cache

```bash
rm -rf .next
npm run dev
```

### Verify Environment Variables

```bash
# Should show your keys
cat .env.local
```

### Check Console

Open browser DevTools (F12) → Console tab

If you see:
- "Supabase not configured" → Check `.env.local`
- "Failed to fetch" → Restart dev server
- CSS not loading → Verify `postcss.config.js` exists and restart

## Need More Help?

Check these files:
- `README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `.env.local.example` - Example environment variables

---

**Quick Links:**
- Google AI API: https://makersuite.google.com/app/apikey
- Supabase: https://supabase.com
- Documentation: README.md



