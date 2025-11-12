-- Digital Footprints - Clean Setup
-- Run this if you're getting column errors

-- Step 1: Drop existing tables (if any)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS session_state CASCADE;
DROP TABLE IF EXISTS session_state_archived CASCADE;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create chat_sessions table with all columns
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Environmental metrics (per session)
    total_tokens INTEGER DEFAULT 0,
    energy_wh DECIMAL(10, 6) DEFAULT 0.0,
    carbon_gco2 DECIMAL(10, 6) DEFAULT 0.0,
    water_l DECIMAL(10, 8) DEFAULT 0.0,
    
    -- Settings (per session)
    model_size TEXT DEFAULT 'Medium (GPT-3.5/Flash)',
    energy_mix TEXT DEFAULT 'US Average Grid',
    water_factor DECIMAL(4, 2) DEFAULT 1.1
);

-- Step 4: Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Step 5: Create indexes
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX idx_chat_sessions_metrics ON chat_sessions(total_tokens, energy_wh, carbon_gco2, water_l);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_role ON messages(role);

-- Step 6: Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies (allow all operations for everyone - shared mode)
CREATE POLICY "Enable all operations for all users" 
ON chat_sessions FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" 
ON messages FOR ALL 
USING (true) 
WITH CHECK (true);

-- Step 8: Add comments
COMMENT ON TABLE chat_sessions IS 'Stores chat sessions with per-session environmental metrics';
COMMENT ON TABLE messages IS 'Stores individual chat messages linked to sessions';

-- Done! You should see "Success. No rows returned"


