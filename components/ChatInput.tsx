"use client";

import React, { useState, FormEvent } from "react";
import { Send } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

export function ChatInput() {
  const { sendMessage, isLoading, currentSession, error } = useChatContext();
  const [input, setInput] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentSession) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="border-t bg-background">
      {error && (
        <div className="px-4 pt-3 pb-2">
          <div className="text-xs bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">
            {error}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <Input
          data-testid="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            currentSession
              ? "What's on your mind?"
              : "Select or create a session to start chatting"
          }
          disabled={isLoading || !currentSession}
          maxLength={MAX_MESSAGE_LENGTH}
          className="flex-1"
        />
        <Button
          data-testid="send-button"
          type="submit"
          disabled={!input.trim() || isLoading || !currentSession}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}


