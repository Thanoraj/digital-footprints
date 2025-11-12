"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number | undefined | null;
  decimals?: number;
  unit?: string;
  icon?: React.ReactNode;
  testId?: string;
}

export function MetricCard({
  label,
  value,
  decimals = 4,
  unit = "",
  icon,
  testId,
}: MetricCardProps) {
  return (
    <Card data-testid={testId} className="overflow-hidden border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">
              {formatNumber(value, decimals)}
              {unit && <span className="text-sm font-normal ml-1 text-muted-foreground">{unit}</span>}
            </p>
          </div>
          {icon && (
            <div className="text-primary opacity-80">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


