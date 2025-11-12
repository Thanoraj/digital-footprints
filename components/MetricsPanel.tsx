"use client";

import React from "react";
import { Zap, Cloud, Droplets, Hash } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Separator } from "@/components/ui/separator";

export function MetricsPanel() {
  const { currentSession } = useChatContext();

  if (!currentSession) {
    return (
      <Card className="h-full border-l">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select or create a session to view metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  // Provide default values for metrics if they're undefined
  const metrics = {
    total_tokens: currentSession.total_tokens ?? 0,
    energy_wh: currentSession.energy_wh ?? 0,
    carbon_gco2: currentSession.carbon_gco2 ?? 0,
    water_l: currentSession.water_l ?? 0,
  };

  return (
    <Card className="h-full border-l flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Session Metrics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current session environmental footprint
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div className="space-y-3">
          <MetricCard
            testId="metric-tokens"
            label="Total Tokens"
            value={metrics.total_tokens}
            decimals={0}
            icon={<Hash className="h-6 w-6" />}
          />

          <MetricCard
            testId="metric-energy"
            label="Energy Used"
            value={metrics.energy_wh}
            decimals={6}
            unit="Wh"
            icon={<Zap className="h-6 w-6" />}
          />

          <MetricCard
            testId="metric-carbon"
            label="Carbon Emitted"
            value={metrics.carbon_gco2}
            decimals={6}
            unit="gCO₂e"
            icon={<Cloud className="h-6 w-6" />}
          />

          <MetricCard
            testId="metric-water"
            label="Water Used"
            value={metrics.water_l}
            decimals={8}
            unit="L"
            icon={<Droplets className="h-6 w-6" />}
          />
        </div>

        <Separator />

        <SettingsPanel />
      </CardContent>
    </Card>
  );
}


