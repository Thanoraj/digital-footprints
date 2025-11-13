"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
  title?: string;
  message?: string;
  showSetupInstructions?: boolean;
}

export function EmptyState({ 
  title = "Environment Setup Required",
  message = "Please configure your environment variables to get started.",
  showSetupInstructions = true 
}: EmptyStateProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {showSetupInstructions && (
            <>
              <div className="rounded-lg bg-secondary/50 p-4 space-y-3 border border-border">
                <h3 className="font-semibold">Quick Setup:</h3>
                
                <div className="space-y-2 text-sm">
                  <p><strong>1. Create `.env.local` file in project root:</strong></p>
                  <pre className="bg-card p-3 rounded border border-border overflow-x-auto text-xs">
{`GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here`}
                  </pre>
                  
                  <p><strong>2. Get your API keys:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Google AI:</strong>{" "}
                      <a 
                        href="https://makersuite.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Get Gemini API Key
                      </a>
                    </li>
                    <li>
                      <strong>Supabase:</strong>{" "}
                      <a 
                        href="https://supabase.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Create Supabase Project
                      </a>
                      {" "}(Settings → API)
                    </li>
                  </ul>
                  
                  <p><strong>3. Set up database:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Go to Supabase SQL Editor</li>
                    <li>Copy and run contents of <code className="bg-background px-1 py-0.5 rounded">supabase/schema.sql</code></li>
                  </ul>
                  
                  <p><strong>4. Restart the dev server:</strong></p>
                  <pre className="bg-card p-3 rounded border border-border text-xs">
npm run dev
                  </pre>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  Need help? Check{" "}
                  <a href="/README.md" className="text-primary hover:underline">
                    README.md
                  </a>{" "}
                  for detailed setup instructions.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



