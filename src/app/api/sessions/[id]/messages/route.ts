import { NextRequest, NextResponse } from "next/server";
import { loadChatHistory } from "@/lib/supabase/queries";

/**
 * GET /api/sessions/[id]/messages
 * Get all messages for a session
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await loadChatHistory(id);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}


