"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageList } from "@/components/MessageList";
import { ChatInput } from "@/components/ChatInput";

export function ChatInterface() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl"></span>
          
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <MessageList />
        </div>
        <ChatInput />
      </CardContent>
    </Card>
  );
}


