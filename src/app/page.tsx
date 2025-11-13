"use client";

import { useEffect, useState } from "react";
import { SessionList } from "@/components/SessionList";
import { ChatInterface } from "@/components/ChatInterface";
import { MetricsPanel } from "@/components/MetricsPanel";
import { EmptyState } from "@/components/EmptyState";

export default function Home() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // For client-side check
    const envCheck = async () => {
      try {
        const response = await fetch('/api/sessions');
        const data = await response.json();
        
        // If we get an error about configuration, show setup
        if (data.error && data.error.includes('not configured')) {
          setIsConfigured(false);
        } else {
          setIsConfigured(true);
        }
      } catch (error) {
        console.error('Environment check failed:', error);
        setIsConfigured(false);
      }
    };

    envCheck();
  }, []);

  // Loading state
  if (isConfigured === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-6xl animate-bounce">🍃</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show setup instructions if not configured
  if (!isConfigured) {
    return <EmptyState />;
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-background">
      {/* Desktop: 3-column layout */}
      <div className="hidden lg:grid lg:grid-cols-[320px_1fr_380px] h-full">
        <div className="overflow-hidden">
          <SessionList />
        </div>
        <div className="overflow-hidden">
          <ChatInterface />
        </div>
        <div className="overflow-hidden">
          <MetricsPanel />
        </div>
      </div>

      {/* Tablet: 2-column layout (sessions + chat, metrics below or hidden) */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr] lg:hidden h-full">
        <div className="overflow-hidden">
          <SessionList />
        </div>
        <div className="overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      </div>

      {/* Mobile: Single column with tabs/drawer */}
      <div className="md:hidden h-full flex flex-col">
        <div className="flex-none h-16 border-b px-4 flex items-center justify-between bg-card">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">🍃</span>
            Digital Footprints
          </h1>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>

        {/* Mobile navigation tabs */}
        <div className="flex-none border-t bg-card">
          <div className="flex justify-around p-2">
            <button className="flex flex-col items-center gap-1 px-4 py-2 text-xs">
              <span>💬</span>
              <span>Chat</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-4 py-2 text-xs opacity-50">
              <span>📊</span>
              <span>Metrics</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-4 py-2 text-xs opacity-50">
              <span>📋</span>
              <span>Sessions</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
