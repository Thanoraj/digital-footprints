# Chat Sessions Feature

## Overview

The Ecomate app now supports **multiple chat sessions**, allowing users to create, manage, and switch between different conversations - similar to ChatGPT's conversation management.

## Features

### 🆕 Create New Chats
- Click the **"➕ New Chat"** button in the sidebar
- Starts a fresh conversation
- Automatically saves to database
- Previous chats are preserved

###  Multiple Sessions
- Manage unlimited chat conversations
- Each session has its own history
- Sessions listed in sidebar by most recent
- Current session highlighted with 🔹 icon

### 🔄 Switch Between Sessions
- Click any session in the sidebar to switch to it
- Instantly loads that session's conversation history
- Gemini AI context resets for each session

### 🏷️ Auto-Titling
- First user message becomes the session title
- Titles truncated to 50 characters
- Helps identify conversations at a glance

### 🗑️ Delete Sessions
- Remove unwanted conversations
- Click the 🗑️ button next to any session
- Cannot delete the currently active session
- Messages automatically deleted (cascade)

### 💾 Persistence
- All sessions saved to Supabase
- Conversations persist across app restarts
- No data loss on redeployment

## User Interface

### Sidebar Layout

```
┌─────────────────────┐
│  Ecomate│
│                      │
│ ➕ New Chat         │ ← Create new session
│ ──────────────────  │
│  Chat Sessions    │
│                      │
│ 🔹 Current Chat      │ ← Active session
│  Previous Chat 🗑️ │ ← Other sessions
│  Another Chat  🗑️ │
│ ...                  │
└─────────────────────┘
```

### Main Area

```
┌────────────────────────────────────────┐
│  Chat                                │
│ ┌─────────────────┬─────────────────┐ │
│ │  Chat Messages  │   Metrics &     │ │
│ │                 │   Settings      │ │
│ │  [conversation] │   [dashboard]   │ │
│ └─────────────────┴─────────────────┘ │
│                                        │
│ What's on your mind? [input]           │
└────────────────────────────────────────┘
```

## Database Schema

### New Table: `chat_sessions`

```sql
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

**Purpose**: Stores chat session metadata

**Fields**:
- `id`: Unique session identifier
- `title`: Session name (auto-generated from first message)
- `created_at`: When session was created
- `updated_at`: Last message timestamp (for sorting)

### Updated Table: `messages`

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
```

**Changes**:
- Added `session_id` foreign key
- Messages belong to specific sessions
- Cascade delete when session deleted

**Indexes**:
- `idx_messages_session_id` - Fast session filtering
- `idx_messages_created_at` - Chronological ordering
- `idx_chat_sessions_updated_at` - Recent sessions first

## Implementation Details

### Session Management Functions

**`load_chat_sessions()`**
- Loads all sessions ordered by most recent
- Called on app startup

**`create_chat_session(title)`**
- Creates new session in database
- Returns session ID
- Called when "New Chat" clicked

**`update_session_timestamp(session_id)`**
- Updates `updated_at` field
- Called after each message
- Keeps sessions sorted by activity

**`update_session_title(session_id, title)`**
- Sets session title
- Called after first user message
- Auto-generates from message content

**`load_chat_history(session_id)`**
- Loads messages for specific session
- Filters by `session_id`
- Called when switching sessions

**`save_message(session_id, role, content, ...)`**
- Saves message to specific session
- Includes session_id in data
- Updates session timestamp

**`delete_chat_session(session_id)`**
- Removes session and its messages
- Cascade delete via foreign key
- Prevents deleting active session (UI)

### Session State Variables

```python
st.session_state.chat_sessions       # List of all sessions
st.session_state.current_session_id  # Active session ID
st.session_state.messages            # Current session messages
```

### Workflow

**App Startup:**
1. Load all chat sessions
2. Select most recent session (or create new)
3. Load messages for current session
4. Display in UI

**New Chat:**
1. User clicks "➕ New Chat"
2. Create new session in database
3. Set as current session
4. Clear messages
5. Reset Gemini chat context
6. Refresh UI

**Switch Session:**
1. User clicks session in sidebar
2. Update `current_session_id`
3. Load messages for that session
4. Reset Gemini chat context
5. Refresh UI

**Send Message:**
1. User sends message
2. Save with `current_session_id`
3. If first message, update session title
4. Update session timestamp
5. Generate AI response
6. Save AI response with same `session_id`

**Delete Session:**
1. User clicks 🗑️ button
2. Delete session from database
3. Messages cascade deleted
4. Reload sessions list
5. Refresh UI

## Testing Checklist

- [ ] Create new chat session
- [ ] Send messages in first session
- [ ] Verify session title updates from first message
- [ ] Create second chat session
- [ ] Switch between sessions
- [ ] Verify messages stay with correct session
- [ ] Delete old session
- [ ] Verify current session cannot be deleted
- [ ] Restart app (or reboot)
- [ ] Verify all sessions persist
- [ ] Verify messages persist in each session

## Benefits

✅ **Organization**: Separate conversations by topic
✅ **Context**: Each session maintains its own AI context
✅ **History**: Access past conversations anytime
✅ **Management**: Easy to delete old/irrelevant chats
✅ **UX**: Familiar pattern (like ChatGPT, Claude, etc.)
✅ **Scalability**: Supports unlimited conversations

## Migration from Previous Version

If you have existing data from the previous version (without sessions):

1. **Old schema**: Messages had no `session_id`
2. **New schema**: Messages require `session_id`

**Migration Steps:**
1. Drop old `messages` table (if exists)
2. Create new schema with `chat_sessions` table
3. Create new `messages` table with `session_id`
4. Old messages will be lost (backup if needed)
5. App will auto-create first session on startup

Alternatively, write a migration script to:
1. Create a default session
2. Assign all existing messages to that session
3. Update schema

## Future Enhancements

- 📝 **Rename Sessions**: Edit session titles manually
- 🔍 **Search**: Find messages across all sessions
- 📤 **Export**: Download session as PDF/JSON
- 🏷️ **Tags**: Categorize sessions with labels
-  **Analytics**: Session statistics and metrics
- 🔒 **Archive**: Hide old sessions without deleting
- ⭐ **Favorites**: Pin important conversations
- 📋 **Copy**: Duplicate a session
- 🗂️ **Folders**: Organize sessions into groups

## Troubleshooting

### Sessions not loading
- Check Supabase connection
- Verify `chat_sessions` table exists
- Check browser console for errors

### Cannot create new session
- Verify database credentials
- Check `chat_sessions` table permissions
- Ensure RLS policies allow inserts

### Messages appear in wrong session
- Check `current_session_id` in session state
- Verify `save_message` includes correct `session_id`
- Inspect `messages` table in Supabase

### Sessions not persisting
- Verify database connection on startup
- Check `load_chat_sessions()` is called
- Ensure sessions saved to database (not just session_state)

## Summary

The chat sessions feature transforms Ecomate from a single conversation app into a full-featured chat management system. Users can now organize multiple conversations, switch between them seamlessly, and maintain persistent history for each session - all while continuing to track the environmental impact of their AI usage.

This brings the app's UX in line with modern AI chat applications while maintaining its unique environmental awareness focus.

