"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ChatSession, Message, CreateSessionRequest } from "@/lib/types";

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  loadSessions: () => Promise<void>;
  createSession: (request?: CreateSessionRequest) => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  refreshCurrentSession: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/sessions");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load sessions");
      }

      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
      console.error("Error loading sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a session and load its messages
  const selectSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load session details
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok) {
        throw new Error(sessionData.error || "Failed to load session");
      }

      setCurrentSession(sessionData.session);

      // Load messages
      const messagesResponse = await fetch(`/api/sessions/${sessionId}/messages`);
      const messagesData = await messagesResponse.json();

      if (!messagesResponse.ok) {
        throw new Error(messagesData.error || "Failed to load messages");
      }

      setMessages(messagesData.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select session");
      console.error("Error selecting session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async (request: CreateSessionRequest = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a configuration error
        if (data.error && data.error.includes('not configured')) {
          setError("⚠️ Please set up your .env.local file with Supabase credentials. See .env.local.example for details.");
        } else {
          throw new Error(data.error || "Failed to create session");
        }
        return;
      }

      await loadSessions();
      await selectSession(data.session.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      console.error("Error creating session:", err);
    } finally {
      setIsLoading(false);
    }
  }, [loadSessions, selectSession]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete session");
      }

      // If we deleted the current session, clear it
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }

      await loadSessions();

      // Auto-select the most recent session if available
      if (sessions.length > 1) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          await selectSession(remainingSessions[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session");
      console.error("Error deleting session:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, sessions, loadSessions, selectSession]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession) {
      setError("No session selected");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSession.id,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle quota errors specially
        if (response.status === 429 && data.isQuotaError) {
          setError("⚠️ Google AI quota exceeded. Please wait a few minutes or get a new API key.");
          return;
        }
        throw new Error(data.error || "Failed to send message");
      }

      // Add messages to UI
      setMessages((prev) => [
        ...prev,
        data.userMessage,
        data.assistantMessage,
      ]);

      // Update current session with new metrics
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              ...data.sessionMetrics,
              updated_at: new Date().toISOString(),
            }
          : null
      );

      // Reload sessions to update the list order
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      console.error("Error sending message:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, loadSessions]);

  // Refresh current session data
  const refreshCurrentSession = useCallback(async () => {
    if (currentSession) {
      await selectSession(currentSession.id);
    }
  }, [currentSession, selectSession]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Auto-select first session if none selected and sessions exist
  useEffect(() => {
    if (!currentSession && sessions.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        selectSession(sessions[0].id);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sessions, currentSession, isLoading, selectSession]);

  const value: ChatContextType = {
    sessions,
    currentSession,
    messages,
    isLoading,
    error,
    loadSessions,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    refreshCurrentSession,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}


