"use client";

import React, { useRef, useEffect } from "react";
import { User, Bot } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function MessageList() {
  const { messages, isLoading } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="text-6xl">🍃</div>
          <h3 className="text-lg font-semibold">Start a Conversation</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Ask me anything and see the environmental impact of your AI conversation in real-time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            data-testid={`message-${message.role}`}
            className={cn(
              "flex gap-3 animate-slide-in",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-eco-100 dark:bg-eco-900 flex items-center justify-center">
                <Bot className="h-5 w-5 text-eco-600 dark:text-eco-400" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] rounded-lg p-4 shadow-sm border",
                message.role === "user"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border"
              )}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start animate-slide-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-eco-100 dark:bg-eco-900 flex items-center justify-center">
              <Bot className="h-5 w-5 text-eco-600 dark:text-eco-400" />
            </div>
            <div className="max-w-[80%] rounded-lg p-4 bg-card border border-border">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}


