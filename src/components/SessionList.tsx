"use client";

import React from "react";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SetupBanner } from "@/components/SetupBanner";

export function SessionList() {
  const {
    sessions,
    currentSession,
    isLoading,
    error,
    createSession,
    selectSession,
    deleteSession,
  } = useChatContext();

  const handleNewSession = async () => {
    await createSession();
  };

  const handleSelectSession = async (sessionId: string) => {
    if (currentSession?.id !== sessionId) {
      await selectSession(sessionId);
    }
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await deleteSession(sessionId);
  };

  return (
    <Card className="flex h-full flex-col border-r">
      <div className="p-2">
        <div className="flex items-center justify-between gap-2 mb-4 h-20">
          <h2 className=" font-semibold flex items-center gap-2 text-2xl pl-2">Ecomate</h2>
        </div>

        <div className="flex">
          <Button
            data-testid="new-session-button"
            onClick={handleNewSession}
            disabled={isLoading}
            className="flex-1 h-12"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          {/* <Button
            data-testid="refresh-sessions-button"
            onClick={loadSessions}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button> */}
        </div>
      </div>

      <Separator />
      
      {error && sessions.length === 0 && <SetupBanner />}

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* {error && (
            <div className="p-3 m-2 text-xs bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              {error}
            </div>
          )} */}

          {sessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {error
                ? "Configure your environment to get started"
                : "No sessions yet. Create one to get started!"}
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = currentSession?.id === session.id;
              return (
                <div
                  key={session.id}
                  data-testid={`session-item-${session.id}`}
                  className={cn(
                    "group relative flex items-start gap-2 p-3 rounded-lg cursor-pointer transition-colors border h-12",
                    isActive ? "bg-accent" : "hover:bg-accent/50 border-transparent"
                  )}
                  onClick={() => handleSelectSession(session.id)}
                >
                  <MessageSquare
                    className={cn(
                      "h-4 w-4 mt-0.5 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    {/* <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(session.updated_at)}
                    </p> */}
                  </div>
                  {!isActive && (
                    <Button
                      data-testid={`delete-session-${session.id}`}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
