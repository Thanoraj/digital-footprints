"use client";

import React, { useState, FormEvent, useMemo } from "react";
import { Send } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { estimateTokens, calculateMetrics, formatNumber } from "@/lib/utils";

export function ChatInput() {
  const { sendMessage, isLoading, currentSession, error } = useChatContext();
  const { modelSize, energyMix, waterFactor } = useSettingsContext();
  const [input, setInput] = useState("");

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
      <form onSubmit={handleSubmit} className="space-y-0 p-4">
        <div className="flex gap-2">
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
        </div>

        {/* Real-time environmental impact preview */}
        {input.trim() && currentSession && (
          <div className="text-xs text-muted-foreground pt-2 px-1 animate-fade-in">
            🌿 {formatNumber(estimatedImpact.carbon_gco2, 6)}g CO₂ will be emitted from this message - about the same as{" "}
            {getComparison(estimatedImpact.carbon_gco2)}.
          </div>
        )}
      </form>
    </div>
  );
}


