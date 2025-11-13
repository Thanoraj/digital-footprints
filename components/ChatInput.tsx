"use client";

import React, { useState, FormEvent, useMemo, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { estimateTokens, calculateMetrics, formatNumber } from "@/lib/utils";

export function ChatInput() {
  const { sendMessage, isLoading, currentSession, error } = useChatContext();
  const { modelSize, energyMix, waterFactor } = useSettingsContext();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate estimated environmental impact as user types
  const estimatedImpact = useMemo(() => {
    if (!input.trim()) {
      return { tokens: 0, energy_wh: 0, carbon_gco2: 0, water_l: 0 };
    }

    const tokens = estimateTokens(input);
    const metrics = calculateMetrics(tokens, {
      model_size: modelSize,
      energy_mix: energyMix,
      water_factor: waterFactor,
    });

    return {
      tokens,
      ...metrics,
    };
  }, [input, modelSize, energyMix, waterFactor]);

  // Generate relatable comparison for carbon emissions
  const getComparison = (carbonGrams: number): string => {
    if (carbonGrams < 0.1) {
      return "less than breathing for 1 second";
    } else if (carbonGrams < 1) {
      const seconds = Math.round(carbonGrams * 10);
      return `charging your phone for ${seconds} seconds`;
    } else if (carbonGrams < 10) {
      const minutes = Math.round(carbonGrams * 2);
      return `charging your phone for ${minutes} minutes`;
    } else if (carbonGrams < 100) {
      const minutes = Math.round(carbonGrams / 5);
      return `watching ${minutes} minutes of Netflix`;
    } else {
      const km = (carbonGrams / 120).toFixed(1);
      return `driving a car for ${km} km`;
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    
    // Calculate the new height (max 8 lines, approximately 24px per line)
    const lineHeight = 24;
    const maxLines = 8;
    const maxHeight = lineHeight * maxLines;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    
    textarea.style.height = `${newHeight}px`;
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentSession) return;

    const message = input.trim();
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="">
      {error && (
        <div className="px-4 pt-3 pb-2">
          <div className="text-xs bg-destructive/10 text-destructive p-2 rounded border border-destructive/20">
            {error}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-0 p-4">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            data-testid="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentSession
                ? "What's on your mind? (Shift+Enter for new line)"
                : "Select or create a session to start chatting"
            }
            disabled={isLoading || !currentSession}
            maxLength={MAX_MESSAGE_LENGTH}
            className="flex-1 max-h-[192px] h-auto min-h-[0] resize-none overflow-y-auto"
            rows={1}
          />
          <Button
            data-testid="send-button"
            type="submit"
            disabled={!input.trim() || isLoading || !currentSession}
            size="icon"
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Real-time environmental impact preview */}
        {input.trim() && currentSession && (
          <div className="text-xs text-muted-foreground text-center pt-2 px-1 animate-fade-in">
            🌿 {formatNumber(estimatedImpact.carbon_gco2, 6)}g CO₂ will be emitted from this message - about the same as{" "}
            {getComparison(estimatedImpact.carbon_gco2)}.
          </div>
        )}
      </form>
    </div>
  );
}


