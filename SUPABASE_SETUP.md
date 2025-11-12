# Supabase Database Setup Guide

This guide will help you set up the required Supabase tables for the Digital Footprints application.

## Prerequisites

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Get your project URL and API key (anon/public key) from Project Settings > API

## Environment Variables

Add these to your `.env` file (for local development) and to Streamlit Cloud secrets:

```
GOOGLE_API_KEY=your_google_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

## Database Tables Setup

### 1. Create `chat_sessions` Table

Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster queries
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Enable Row Level Security (optional, for production)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust for your needs)
CREATE POLICY "Allow all operations on chat_sessions" ON chat_sessions
FOR ALL USING (true) WITH CHECK (true);
```

### 2. Create `messages` Table

Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for faster queries
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (optional, for production)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust for your needs)
CREATE POLICY "Allow all operations on messages" ON messages
FOR ALL USING (true) WITH CHECK (true);
```

### 3. Create `session_state` Table

Run this SQL in the Supabase SQL Editor:

```sql
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

-- Enable Row Level Security (optional, for production)
ALTER TABLE session_state ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust for your needs)
CREATE POLICY "Allow all operations on session_state" ON session_state
FOR ALL USING (true) WITH CHECK (true);
```

## Streamlit Cloud Deployment

### Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Add Supabase integration and 3-column layout"
git push origin main
```

### Step 2: Deploy to Streamlit Cloud

1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Click "New app"
3. Select your repository, branch, and main file (`app.py`)
4. Click "Advanced settings"
5. Add your secrets:

```toml
GOOGLE_API_KEY = "your_google_api_key_here"
SUPABASE_URL = "your_supabase_project_url"
SUPABASE_KEY = "your_supabase_anon_key"
```

6. Click "Deploy"

## Verification

After deployment:

1. Open your Streamlit app
2. Send a test message
3. Check your Supabase dashboard:
   - Go to Table Editor
   - Verify `messages` table has your message
   - Verify `session_state` table has been initialized with metrics

## Troubleshooting

### Database Connection Issues

- Verify your `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check that RLS policies allow operations
- Ensure tables are created with exact column names and types

### Chat History Not Persisting

- Check Supabase logs in the dashboard
- Verify the `messages` table has rows after sending messages
- Check browser console for errors

### Metrics Not Updating

- Verify `session_state` table has a row
- Check that the row updates when you send messages
- Ensure floating-point columns are using `DOUBLE PRECISION` type

## Optional: Reset Database

To clear all data and start fresh:

```sql
-- Clear all messages
TRUNCATE TABLE messages;

-- Clear session state
TRUNCATE TABLE session_state;
```

## Security Considerations for Production

The current RLS policies allow all operations. For production, consider:

1. Implementing user authentication
2. Restricting operations based on user roles
3. Adding rate limiting
4. Using service role key only on backend operations

Example secure policy (requires authentication):

```sql
-- Drop permissive policy
DROP POLICY "Allow all operations on messages" ON messages;

-- Create authenticated-only policy
CREATE POLICY "Authenticated users can manage messages" ON messages
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

