"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ModelSize, EnergyMix } from "@/lib/types";
import {
  DEFAULT_MODEL_SIZE,
  DEFAULT_ENERGY_MIX,
  DEFAULT_WATER_FACTOR,
} from "@/lib/constants";
import { useChatContext } from "./ChatContext";

interface SettingsContextType {
  modelSize: ModelSize;
  energyMix: EnergyMix;
  waterFactor: number;
  isLoading: boolean;
  updateModelSize: (modelSize: ModelSize) => Promise<void>;
  updateEnergyMix: (energyMix: EnergyMix) => Promise<void>;
  updateWaterFactor: (waterFactor: number) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { currentSession, refreshCurrentSession } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);

  // Use current session settings or defaults
  const modelSize = currentSession?.model_size || DEFAULT_MODEL_SIZE;
  const energyMix = currentSession?.energy_mix || DEFAULT_ENERGY_MIX;
  const waterFactor = currentSession?.water_factor || DEFAULT_WATER_FACTOR;

  // Update model size for current session
  const updateModelSize = useCallback(
    async (newModelSize: ModelSize) => {
      if (!currentSession) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/sessions/${currentSession.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model_size: newModelSize }),
        });

        if (!response.ok) {
          throw new Error("Failed to update model size");
        }

        await refreshCurrentSession();
      } catch (error) {
        console.error("Error updating model size:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, refreshCurrentSession]
  );

  // Update energy mix for current session
  const updateEnergyMix = useCallback(
    async (newEnergyMix: EnergyMix) => {
      if (!currentSession) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/sessions/${currentSession.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ energy_mix: newEnergyMix }),
        });

        if (!response.ok) {
          throw new Error("Failed to update energy mix");
        }

        await refreshCurrentSession();
      } catch (error) {
        console.error("Error updating energy mix:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, refreshCurrentSession]
  );

  // Update water factor for current session
  const updateWaterFactor = useCallback(
    async (newWaterFactor: number) => {
      if (!currentSession) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/sessions/${currentSession.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ water_factor: newWaterFactor }),
        });

        if (!response.ok) {
          throw new Error("Failed to update water factor");
        }

        await refreshCurrentSession();
      } catch (error) {
        console.error("Error updating water factor:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSession, refreshCurrentSession]
  );

  const value: SettingsContextType = {
    modelSize,
    energyMix,
    waterFactor,
    isLoading,
    updateModelSize,
    updateEnergyMix,
    updateWaterFactor,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }
  return context;
}


