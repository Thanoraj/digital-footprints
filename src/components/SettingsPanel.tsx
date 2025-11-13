"use client";

import React from "react";
import { useSettingsContext } from "@/contexts/SettingsContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ENERGY_PER_KILOTOKEN_WH, CARBON_INTENSITY_G_PER_KWH } from "@/lib/constants";
import type { ModelSize, EnergyMix } from "@/lib/types";

export function SettingsPanel() {
  const {
    modelSize,
    energyMix,
    waterFactor,
    updateModelSize,
    updateEnergyMix,
    updateWaterFactor,
  } = useSettingsContext();

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        These settings affect environmental calculations for this session (per 1,000 tokens)
      </p>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">AI Model Size</label>
          <Select
            value={modelSize}
            onValueChange={(value) => updateModelSize(value as ModelSize)}
          >
            <SelectTrigger data-testid="model-size-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(ENERGY_PER_KILOTOKEN_WH).map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Energy Mix</label>
          <Select
            value={energyMix}
            onValueChange={(value) => updateEnergyMix(value as EnergyMix)}
          >
            <SelectTrigger data-testid="energy-mix-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CARBON_INTENSITY_G_PER_KWH).map((mix) => (
                <SelectItem key={mix} value={mix}>
                  {mix}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Water Factor (L/kWh)</label>
          <Input
            data-testid="water-factor-input"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={waterFactor}
            onChange={(e) => updateWaterFactor(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
}


