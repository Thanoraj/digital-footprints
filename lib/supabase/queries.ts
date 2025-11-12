import { supabase } from "./client";
import type {
  ChatSession,
  Message,
  MessageInput,
  CreateSessionRequest,
  UpdateSessionRequest,
  Metrics,
} from "../types";
import {
  DEFAULT_MODEL_SIZE,
  DEFAULT_ENERGY_MIX,
  DEFAULT_WATER_FACTOR,
} from "../constants";

/**
 * Load all chat sessions ordered by most recent
 */
export async function loadChatSessions(): Promise<ChatSession[]> {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase not configured, returning empty sessions");
      return [];
    }

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading chat sessions:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to load chat sessions:", error);
    return [];
  }
}

/**
 * Load a specific chat session by ID
 */
export async function loadChatSession(sessionId: string): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error("Error loading chat session:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to load chat session:", error);
    return null;
  }
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  request: CreateSessionRequest = {}
): Promise<ChatSession | null> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("❌ Supabase not configured - cannot create session");
      console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
      return null;
    }

    const now = new Date().toISOString();
    const sessionData = {
      title: request.title || "New Chat",
      created_at: now,
      updated_at: now,
      total_tokens: 0,
      energy_wh: 0.0,
      carbon_gco2: 0.0,
      water_l: 0.0,
      model_size: request.model_size || DEFAULT_MODEL_SIZE,
      energy_mix: request.energy_mix || DEFAULT_ENERGY_MIX,
      water_factor: request.water_factor || DEFAULT_WATER_FACTOR,
    };

    console.log("📝 Attempting to create session with data:", { title: sessionData.title });

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error creating chat session:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      
      if (error.code === "42P01") {
        console.error("💡 Table 'chat_sessions' does not exist. Run supabase/schema.sql to create it.");
      } else if (error.code === "42703") {
        console.error("💡 Column missing in 'chat_sessions' table. Run supabase/migrations/002_session_metrics.sql to add metric columns.");
      } else if (error.message.includes("permission") || error.message.includes("RLS")) {
        console.error("💡 Row Level Security (RLS) is blocking the insert. Check RLS policies in Supabase.");
      }
      
      throw error;
    }

    console.log("✅ Successfully created session:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Failed to create chat session:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return null;
  }
}

/**
 * Update a chat session
 */
export async function updateChatSession(
  sessionId: string,
  updates: UpdateSessionRequest
): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating chat session:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to update chat session:", error);
    return null;
  }
}

/**
 * Update session timestamp (for sorting by activity)
 */
export async function updateSessionTimestamp(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session timestamp:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to update session timestamp:", error);
    return false;
  }
}

/**
 * Update session title
 */
export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chat_sessions")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session title:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to update session title:", error);
    return false;
  }
}

/**
 * Update session metrics (cumulative for the session)
 */
export async function updateSessionMetrics(
  sessionId: string,
  metrics: Partial<Metrics>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chat_sessions")
      .update({
        ...metrics,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session metrics:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to update session metrics:", error);
    return false;
  }
}

/**
 * Delete a chat session (cascade deletes messages)
 */
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Error deleting chat session:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to delete chat session:", error);
    return false;
  }
}

/**
 * Load all messages for a specific session
 */
export async function loadChatHistory(sessionId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading chat history:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
}

/**
 * Save a message to the database
 */
export async function saveMessage(messageInput: MessageInput): Promise<Message | null> {
  try {
    const messageData = {
      session_id: messageInput.session_id,
      role: messageInput.role,
      content: messageInput.content,
      input_tokens: messageInput.input_tokens || 0,
      output_tokens: messageInput.output_tokens || 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error("Error saving message:", error);
      throw error;
    }

    // Update session timestamp
    await updateSessionTimestamp(messageInput.session_id);

    return data;
  } catch (error) {
    console.error("Failed to save message:", error);
    return null;
  }
}

/**
 * Get message count for a session
 */
export async function getMessageCount(sessionId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error getting message count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Failed to get message count:", error);
    return 0;
  }
}


