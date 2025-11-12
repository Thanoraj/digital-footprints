# Quick Start Guide

## ✅ Fixed Issues

The app has been updated to fix the Streamlit API error. The chat input is now properly positioned outside the columns.

## 🚀 Test the App Locally (Without Database)

The app will work without Supabase - it just won't persist data between sessions.

### Option 1: Test Without Persistence

1. **Set only Google API Key** in a `.env` file:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

2. **Run the app**:
   ```bash
   streamlit run app.py
   ```

3. **What you'll see**:
   - ✅ 3-column layout working
   - ✅ Chat functionality working
   - ⚠️ "Database not connected" warnings (expected)
   - ❌ Chat history won't persist between sessions

### Option 2: Full Setup with Persistence

1. **Create Supabase account** at [supabase.com](https://supabase.com)

2. **Create new project** and wait for provisioning

3. **Create database tables** by running this SQL in Supabase SQL Editor:

```sql
-- Chat sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Session state table
CREATE TABLE session_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queries_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    energy_wh DOUBLE PRECISION DEFAULT 0.0,
    carbon_gco2 DOUBLE PRECISION DEFAULT 0.0,
    water_l DOUBLE PRECISION DEFAULT 0.0,
    model_size TEXT DEFAULT 'Medium (GPT-3.5/Flash)',
    energy_mix TEXT DEFAULT 'US Average Grid',
    water_factor DOUBLE PRECISION DEFAULT 1.1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and create permissive policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on chat_sessions" ON chat_sessions
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on messages" ON messages
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on session_state" ON session_state
FOR ALL USING (true) WITH CHECK (true);
```

4. **Get your credentials** from Supabase Project Settings > API:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_KEY` (anon/public key)

5. **Create `.env` file** with all credentials:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=your_supabase_anon_key_here
   ```

6. **Run the app**:
   ```bash
   streamlit run app.py
   ```

7. **What you'll see**:
   - ✅ 3-column layout working
   - ✅ Chat functionality working
   - ✅ No database warnings
   - ✅ Chat history persists between sessions

## 🎯 Current Status

- ✅ **App Structure**: Sidebar + 2-column layout
- ✅ **Chat Sessions**: Multiple conversation management
- ✅ **Chat Input**: Fixed Streamlit API error
- ✅ **Dependencies**: Supabase package installed
- ✅ **Graceful Fallback**: Works without database
- ⚠️ **Database**: Tables need to be created in Supabase

## ✨ New Features

- 🆕 **Multiple Chat Sessions**: Create and manage multiple conversations
- 🔄 **Switch Between Chats**: Click on any session to switch to it
- ➕ **New Chat Button**: Start fresh conversations anytime
- 🗑️ **Delete Sessions**: Remove old conversations
- 🏷️ **Auto-Title**: Sessions automatically titled from first message
- 💾 **Session Persistence**: All sessions saved to database

## 🔧 Troubleshooting

### "relation does not exist" errors
- This means Supabase tables haven't been created yet
- Follow Option 2 above to create the tables
- Or ignore if you just want to test without persistence

### "Google AI API Key not found"
- Set `GOOGLE_API_KEY` in your `.env` file
- Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Chat input not working
- This has been fixed in the latest version
- Make sure you're running the updated `app.py`

## 🚀 Next Steps

1. **Test locally** with Option 1 (no database) to verify layout
2. **Set up Supabase** with Option 2 for full persistence
3. **Deploy to Streamlit Cloud** following DEPLOYMENT_CHECKLIST.md

The app is now ready to run! 🎉
