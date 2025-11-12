-- Migration: Add per-session metrics tracking
-- This migrates from global session_state to per-session metrics

-- Step 1: Add metric columns to chat_sessions table
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS energy_wh DECIMAL(10, 6) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS carbon_gco2 DECIMAL(10, 6) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS water_l DECIMAL(10, 8) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS model_size TEXT DEFAULT 'Medium (GPT-3.5/Flash)',
ADD COLUMN IF NOT EXISTS energy_mix TEXT DEFAULT 'US Average Grid',
ADD COLUMN IF NOT EXISTS water_factor DECIMAL(4, 2) DEFAULT 1.1;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN chat_sessions.total_tokens IS 'Cumulative tokens used in this session';
COMMENT ON COLUMN chat_sessions.energy_wh IS 'Cumulative energy consumption in Watt-hours';
COMMENT ON COLUMN chat_sessions.carbon_gco2 IS 'Cumulative carbon emissions in grams CO2e';
COMMENT ON COLUMN chat_sessions.water_l IS 'Cumulative water usage in liters';
COMMENT ON COLUMN chat_sessions.model_size IS 'AI model size setting for calculations';
COMMENT ON COLUMN chat_sessions.energy_mix IS 'Energy grid mix setting for carbon calculations';
COMMENT ON COLUMN chat_sessions.water_factor IS 'Water usage factor (L/kWh)';

-- Step 3: Create index for efficient metric queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_metrics 
ON chat_sessions(total_tokens, energy_wh, carbon_gco2, water_l);

-- Step 4: Archive old session_state table (don't delete in case rollback needed)
ALTER TABLE IF EXISTS session_state RENAME TO session_state_archived;

-- Step 5: Update RLS policies for new columns (if RLS is enabled)
-- Allow all operations on chat_sessions for now (shared mode, no auth)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for all users" ON chat_sessions;
CREATE POLICY "Enable all operations for all users" 
ON chat_sessions FOR ALL 
USING (true) 
WITH CHECK (true);


