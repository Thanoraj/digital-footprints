import { NextRequest, NextResponse } from "next/server";
import { loadChatSessions, createChatSession } from "@/lib/supabase/queries";
import type { CreateSessionRequest } from "@/lib/types";

/**
 * GET /api/sessions
 * List all chat sessions
 */
export async function GET() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { 
          error: "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
          sessions: []
        },
        { status: 200 }
      );
    }

    const sessions = await loadChatSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to fetch sessions",
        sessions: []
      },
      { status: 200 } // Return 200 with empty array instead of 500
    );
  }
}

/**
 * POST /api/sessions
 * Create a new chat session
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("❌ Supabase environment variables not configured");
      console.error("Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
      console.error("See ENVIRONMENT_SETUP.md for setup instructions");
      
      return NextResponse.json(
        { 
          error: "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see ENVIRONMENT_SETUP.md)" 
        },
        { status: 400 }
      );
    }

    const body: CreateSessionRequest = await request.json();
    const session = await createChatSession(body);

    if (!session) {
      console.error("❌ Failed to create session - createChatSession returned null");
      console.error("This usually means the Supabase table is missing or RLS policies are blocking access");
      console.error("Run the SQL in supabase/schema.sql to create the tables");
      
      return NextResponse.json(
        { 
          error: "Failed to create session. Check that Supabase tables exist and RLS policies allow access. See console for details." 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating session:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? `Failed to create session: ${error.message}` 
          : "Failed to create session. Check server console for details." 
      },
      { status: 500 }
    );
  }
}
