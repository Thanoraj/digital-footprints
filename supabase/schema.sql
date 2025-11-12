-- Digital Footprints Database Schema
-- Complete schema for Next.js application with per-session metrics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat Sessions Table
-- Stores chat sessions with embedded environmental metrics
CREATE TABLE IF NOT EXISTS chat_sessions (
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

-- Messages Table
-- Stores individual messages with token counts
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_metrics ON chat_sessions(total_tokens, energy_wh, carbon_gco2, water_l);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- Row Level Security (RLS) Policies
-- For shared mode (no authentication), allow all operations
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Chat sessions: Allow all operations for everyone
DROP POLICY IF EXISTS "Enable all operations for all users" ON chat_sessions;
CREATE POLICY "Enable all operations for all users" 
ON chat_sessions FOR ALL 
USING (true) 
WITH CHECK (true);

-- Messages: Allow all operations for everyone
DROP POLICY IF EXISTS "Enable all operations for all users" ON messages;
CREATE POLICY "Enable all operations for all users" 
ON messages FOR ALL 
USING (true) 
WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE chat_sessions IS 'Stores chat sessions with per-session environmental metrics';
COMMENT ON TABLE messages IS 'Stores individual chat messages linked to sessions';

COMMENT ON COLUMN chat_sessions.total_tokens IS 'Cumulative tokens used in this session';
COMMENT ON COLUMN chat_sessions.energy_wh IS 'Cumulative energy consumption in Watt-hours';
COMMENT ON COLUMN chat_sessions.carbon_gco2 IS 'Cumulative carbon emissions in grams CO2e';
COMMENT ON COLUMN chat_sessions.water_l IS 'Cumulative water usage in liters';
COMMENT ON COLUMN chat_sessions.model_size IS 'AI model size setting for calculations';
COMMENT ON COLUMN chat_sessions.energy_mix IS 'Energy grid mix setting for carbon calculations';
COMMENT ON COLUMN chat_sessions.water_factor IS 'Water usage factor (L/kWh)';

COMMENT ON COLUMN messages.input_tokens IS 'Estimated input tokens for this message';
COMMENT ON COLUMN messages.output_tokens IS 'Estimated output tokens for this message';


