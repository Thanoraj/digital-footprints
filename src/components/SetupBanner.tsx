"use client";

import React from "react";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SetupBanner() {
  return (
    <Card className="mx-4 mt-4 border-destructive/50 bg-destructive/10">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-sm">Environment Setup Required</h3>
            <p className="text-xs text-muted-foreground">
              Create <code className="bg-secondary px-1 py-0.5 rounded">.env.local</code> file in the project root with:
            </p>
            <pre className="text-xs bg-card p-2 rounded border border-border overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GOOGLE_API_KEY=your-google-api-key-here`}
            </pre>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                📚 See <code className="bg-muted px-1 py-0.5 rounded">ENVIRONMENT_SETUP.md</code> for detailed instructions
              </p>
              <div className="flex gap-2 text-xs">
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Get Google AI Key <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-muted-foreground">•</span>
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Setup Supabase <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
              <strong>⚠️ Migrating from Streamlit?</strong>
              <br />
              Variable names have changed:
              <ul className="list-disc list-inside mt-1 space-y-0.5 ml-2">
                <li><code className="text-xs">SUPABASE_URL</code> → <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code></li>
                <li><code className="text-xs">SUPABASE_KEY</code> → <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

