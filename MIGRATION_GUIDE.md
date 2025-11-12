# Migration Guide: Streamlit to Next.js

This guide helps you migrate from the Streamlit version to the Next.js version of Digital Footprints.

## Major Changes

### Architecture

| Aspect | Streamlit (Old) | Next.js (New) |
|--------|----------------|---------------|
| **Framework** | Python/Streamlit | Next.js 15/React 19 |
| **Language** | Python | TypeScript |
| **Routing** | Single page | App Router |
| **State** | Session state | React Context |
| **Styling** | Streamlit defaults | Tailwind CSS + shadcn/ui |
| **API** | Direct calls | Next.js API routes |
| **Deployment** | Streamlit Cloud | Vercel/any Node host |

### Metrics Tracking

**Key Change**: Metrics are now **per-session** instead of cumulative/global.

**Old Behavior:**
- Single `session_state` table
- Global metrics across all users
- Cumulative across all sessions

**New Behavior:**
- Metrics stored in `chat_sessions` table
- Each session has its own metrics
- Settings (model, energy mix) per session

### Database Schema Changes

#### New Tables

```sql
-- chat_sessions table (updated with metrics)
ALTER TABLE chat_sessions ADD COLUMN total_tokens INTEGER DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN energy_wh DECIMAL(10, 6) DEFAULT 0.0;
ALTER TABLE chat_sessions ADD COLUMN carbon_gco2 DECIMAL(10, 6) DEFAULT 0.0;
ALTER TABLE chat_sessions ADD COLUMN water_l DECIMAL(10, 8) DEFAULT 0.0;
ALTER TABLE chat_sessions ADD COLUMN model_size TEXT DEFAULT 'Medium (GPT-3.5/Flash)';
ALTER TABLE chat_sessions ADD COLUMN energy_mix TEXT DEFAULT 'US Average Grid';
ALTER TABLE chat_sessions ADD COLUMN water_factor DECIMAL(4, 2) DEFAULT 1.1;
```

#### Removed Tables

- `session_state` table (archived as `session_state_archived`)

### Feature Mapping

| Streamlit Feature | Next.js Equivalent | Notes |
|-------------------|-------------------|--------|
| `st.session_state` | React Context | ChatContext, SettingsContext |
| `st.chat_message()` | `MessageList` component | Styled with Tailwind |
| `st.chat_input()` | `ChatInput` component | Form-based input |
| `st.sidebar` | `SessionList` component | Left panel |
| `st.columns()` | CSS Grid/Flexbox | Responsive 3-column layout |
| `st.metric()` | `MetricCard` component | shadcn/ui Card |
| `st.select_slider()` | `Select` component | Radix Select |
| `st.button()` | `Button` component | shadcn/ui Button |

## Migration Steps

### For Developers

#### 1. Environment Setup

**Old (.env for Streamlit):**
```env
GOOGLE_API_KEY=xxx
SUPABASE_URL=xxx
SUPABASE_KEY=xxx
```

**New (.env.local for Next.js):**
```env
GOOGLE_API_KEY=xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

#### 2. Database Migration

Run the migration script:

```bash
# In Supabase SQL Editor
-- Run supabase/migrations/002_session_metrics.sql
```

This will:
- Add metric columns to `chat_sessions`
- Archive old `session_state` table
- Update indexes

#### 3. Code Migration

**Old (Python/Streamlit):**
```python
# app.py
st.session_state.metrics["total_tokens"] += tokens
st.metric(label="Total Tokens", value=st.session_state.metrics["total_tokens"])
```

**New (TypeScript/Next.js):**
```typescript
// contexts/ChatContext.tsx
const { currentSession } = useChatContext();

// components/MetricsPanel.tsx
<MetricCard 
  label="Total Tokens" 
  value={currentSession.total_tokens} 
/>
```

### For Users

#### Data Preservation

**Existing chat history** in the `messages` table will be preserved. However:
- Old sessions won't have metrics (will start at 0)
- Global cumulative metrics from `session_state` won't carry over
- Each session now tracks independently

#### Fresh Start Option

For a clean slate:
1. Export existing data (if needed)
2. Drop and recreate tables using `supabase/schema.sql`
3. Start with new Next.js app

## API Changes

### Chat Endpoint

**Old:**
Direct Gemini API calls in Streamlit

**New:**
Next.js API route

```typescript
POST /api/chat
{
  "session_id": "uuid",
  "content": "message"
}

Response:
{
  "userMessage": {...},
  "assistantMessage": {...},
  "metrics": {...},
  "sessionMetrics": {...}
}
```

### Session Management

**New endpoints:**
```
GET    /api/sessions              # List all sessions
POST   /api/sessions              # Create session
GET    /api/sessions/[id]         # Get session
PATCH  /api/sessions/[id]         # Update session
DELETE /api/sessions/[id]         # Delete session
GET    /api/sessions/[id]/messages # Get messages
```

## Component Migration Guide

### Session List (Sidebar)

**Old:**
```python
with st.sidebar:
    if st.button("➕ New Chat"):
        create_session()
    for session in sessions:
        st.button(session["title"])
```

**New:**
```tsx
<SessionList />
// Handles create, select, delete automatically
```

### Chat Messages

**Old:**
```python
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
```

**New:**
```tsx
<MessageList />
// Renders all messages with styling
```

### Metrics Display

**Old:**
```python
st.metric("Energy (Wh)", f"{metrics['energy_wh']:.4f}")
```

**New:**
```tsx
<MetricCard
  label="Energy Used"
  value={session.energy_wh}
  decimals={6}
  unit="Wh"
/>
```

### Settings Controls

**Old:**
```python
model_size = st.select_slider(
    "AI Model Size",
    options=list(ENERGY_PER_KILOTOKEN_WH.keys())
)
```

**New:**
```tsx
<Select
  value={modelSize}
  onValueChange={updateModelSize}
>
  {/* options */}
</Select>
```

## Deployment Migration

### From Streamlit Cloud to Vercel

1. **Export environment variables** from Streamlit Cloud
2. **Push code** to GitHub
3. **Import in Vercel**
4. **Add environment variables** in Vercel dashboard
5. **Deploy**

### Database

No migration needed - continue using same Supabase project. Just run the schema migration.

## Breaking Changes

### Metrics Scope

⚠️ **BREAKING**: Metrics are now per-session, not global.

**Impact**: Users expecting cumulative metrics across all sessions will see per-session metrics instead.

**Migration Path**: If you need global metrics, calculate them client-side by summing all sessions.

### Settings Scope

⚠️ **BREAKING**: Settings are now per-session.

**Impact**: Each session can have different model size, energy mix, and water factor.

**Migration Path**: Update existing sessions with default settings via SQL:

```sql
UPDATE chat_sessions SET
  model_size = 'Medium (GPT-3.5/Flash)',
  energy_mix = 'US Average Grid',
  water_factor = 1.1
WHERE model_size IS NULL;
```

## Testing After Migration

### Checklist

- [ ] Load application
- [ ] Create new session
- [ ] Send message and receive response
- [ ] Verify metrics display correctly
- [ ] Change settings (model size, energy mix, water factor)
- [ ] Create multiple sessions
- [ ] Switch between sessions
- [ ] Delete session
- [ ] Verify data persists after refresh
- [ ] Test on mobile device
- [ ] Install as PWA
- [ ] Test offline mode

## Rollback Plan

If you need to rollback:

1. **Keep old Streamlit app** available
2. **Restore session_state table** from `session_state_archived`
3. **Switch DNS/deployment** back to Streamlit version

Database rollback:
```sql
-- Restore old table
ALTER TABLE session_state_archived RENAME TO session_state;

-- Remove new columns (optional)
ALTER TABLE chat_sessions DROP COLUMN IF EXISTS total_tokens;
-- (continue for other metric columns)
```

## Support

For migration issues:
- Check [README.md](README.md) for setup
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment
- Open GitHub issue for bugs

---

Need help? Open an issue with the `migration` label.


