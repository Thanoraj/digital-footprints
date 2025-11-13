# Troubleshooting Guide

## Common Issues and Solutions

### 500 Error: "Failed to create session"

**Symptoms:**
- Clicking "New Chat" returns a 500 Internal Server Error
- Console shows: `POST http://localhost:3000/api/sessions 500 (Internal Server Error)`
- Error message: "Failed to create session"

**Causes & Solutions:**

#### 1. Missing or Incorrect Environment Variables

**Check:** Do you have a `.env.local` file in the project root?

**Solution:**
```bash
# Create .env.local with these variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GOOGLE_API_KEY=your-google-api-key-here
```

** Important:** Variable names must be exact. If migrating from Streamlit:
- ❌ `SUPABASE_URL` → ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ❌ `SUPABASE_KEY` → ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Verify your setup:**
- Check the dev server console for detailed error messages
- Look for logs starting with ❌ that explain the specific issue
- Restart the dev server after changing `.env.local`

#### 2. Supabase Database Not Set Up

**Check:** Do you see this error in the server console?
```
❌ Table 'chat_sessions' does not exist
```

**Solution:**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `supabase/schema.sql`
4. Alternatively, if you have existing tables, run `supabase/migrations/002_session_metrics.sql`

#### 3. Row Level Security (RLS) Policies Blocking Access

**Check:** Do you see this error?
```
❌ Row Level Security (RLS) is blocking the insert
```

**Solution:**
1. Go to Supabase **Table Editor** > `chat_sessions`
2. Click **RLS Policies**
3. Ensure this policy exists:
   ```sql
   CREATE POLICY "Enable all operations for all users" 
   ON chat_sessions FOR ALL 
   USING (true) 
   WITH CHECK (true);
   ```
4. Alternatively, run the full `supabase/schema.sql` which includes the policies

#### 4. Missing Columns in Database

**Check:** Do you see this error?
```
❌ Column missing in 'chat_sessions' table
Error code: 42703
```

**Solution:**
Run the migration to add metric columns:
```bash
# In Supabase SQL Editor, run:
# supabase/migrations/002_session_metrics.sql
```

This adds columns like `total_tokens`, `energy_wh`, `carbon_gco2`, etc.

---

### Port Already in Use

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or run on a different port
pnpm dev -- -p 3001
```

---

### "Supabase not configured" Warning

**Symptoms:**
- Setup banner shows in the UI
- Console shows: ` Missing Supabase environment variables`

**Solution:**
1. Verify `.env.local` exists in project root
2. Check variable names are correct (must start with `NEXT_PUBLIC_`)
3. Restart dev server: `pnpm dev`

---

### Database Connection Issues

**Symptoms:**
- Errors about connection refused or timeout
- Can't fetch or create sessions

**Checklist:**
- [ ] Supabase project is active (not paused)
- [ ] URL in `.env.local` matches your project URL (Settings > API)
- [ ] Anon key in `.env.local` matches your project key
- [ ] No typos in environment variable names
- [ ] Dev server was restarted after changing `.env.local`

**Test connection:**
1. Open Supabase dashboard
2. Go to **Table Editor** > `chat_sessions`
3. Try manually inserting a row
4. If that fails, check your database status

---

### Sessions Load But Can't Create New Ones

**Symptoms:**
- Existing sessions appear
- Can't create new sessions (500 error)

**Solution:**
Check server console for specific error. Common causes:
- RLS policies allow SELECT but not INSERT
- Missing required columns in schema
- Database quota exceeded (check Supabase dashboard)

**Fix RLS for insert:**
```sql
-- Run in Supabase SQL Editor
DROP POLICY IF EXISTS "Enable all operations for all users" ON chat_sessions;

CREATE POLICY "Enable all operations for all users" 
ON chat_sessions FOR ALL 
USING (true) 
WITH CHECK (true);
```

---

### TypeScript Errors

**Symptoms:**
- Red squiggles in editor
- Build fails with type errors

**Solution:**
```bash
# Check for type errors
pnpm type-check

# If errors in types, ensure all dependencies are installed
pnpm install
```

---

### Messages Not Appearing After Sending

**Symptoms:**
- Message sent successfully
- UI doesn't update with response

**Potential causes:**
1. Google AI API key invalid or quota exceeded
2. Chat API route error (check `/api/chat/route.ts`)
3. Message not saved to database

**Check:**
```bash
# Watch server console for errors when sending message
# Look for POST /api/chat logs
```

---

## Getting More Help

### Enable Detailed Logging

The app now includes enhanced error logging. Check your **terminal/console** where the dev server is running for detailed error messages with:
- ❌ Error indicators
- 💡 Helpful suggestions
- Specific error codes and messages

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to **Logs** > **Database**
3. Look for errors when creating sessions

### Verify Setup

Run this checklist:
- [ ] `.env.local` file exists in project root
- [ ] Variables start with `NEXT_PUBLIC_` (for Supabase)
- [ ] Supabase project is active
- [ ] Database tables exist (run `supabase/schema.sql`)
- [ ] RLS policies allow operations
- [ ] Dev server restarted after env changes
- [ ] Google AI API key is valid

### Still Having Issues?

1. Check the server console for error messages with ❌
2. Look for suggestions marked with 💡
3. Verify your Supabase credentials in Project Settings > API
4. Try the setup from scratch following `ENVIRONMENT_SETUP.md`

---

## Quick Reset

If everything is broken and you want to start fresh:

### 1. Reset Environment
```bash
# Delete and recreate .env.local
rm .env.local
# Copy example and fill in your actual values
# (create from ENVIRONMENT_SETUP.md instructions)
```

### 2. Reset Database
```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;

-- Then run supabase/schema.sql to recreate tables
```

### 3. Reset Node Modules
```bash
rm -rf node_modules .next
pnpm install
pnpm dev
```



