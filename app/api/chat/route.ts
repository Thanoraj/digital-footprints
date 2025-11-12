import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  saveMessage,
  loadChatSession,
  updateSessionMetrics,
  updateSessionTitle,
  getMessageCount,
} from "@/lib/supabase/queries";
import { estimateTokens, calculateMetrics, generateSessionTitle } from "@/lib/utils";
import { GEMINI_MODEL } from "@/lib/constants";
import type { SendMessageRequest, Settings } from "@/lib/types";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { session_id, content } = body;

    if (!session_id || !content) {
      return NextResponse.json(
        { error: "Missing session_id or content" },
        { status: 400 }
      );
    }

    // Load session to get settings
    const session = await loadChatSession(session_id);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Estimate input tokens
    const inputTokens = estimateTokens(content);

    // Save user message
    const userMessage = await saveMessage({
      session_id,
      role: "user",
      content,
      input_tokens: inputTokens,
      output_tokens: 0,
    });

    if (!userMessage) {
      return NextResponse.json(
        { error: "Failed to save user message" },
        { status: 500 }
      );
    }

    // Auto-generate title from first message
    const messageCount = await getMessageCount(session_id);
    if (messageCount === 1) {
      const title = generateSessionTitle(content);
      await updateSessionTitle(session_id, title);
    }

    // Generate AI response using Gemini
    let aiResponse: string;
    try {
      console.log("Using model:", genAI);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await model.generateContent(content);
      const response = await result.response;
      aiResponse = response.text();
    } catch (apiError: any) {
      // Handle specific API errors
      if (apiError.message?.includes("quota") || apiError.message?.includes("429")) {
        return NextResponse.json(
          { 
            error: "Google AI API quota exceeded. Please wait a few minutes and try again, or check your API key at https://makersuite.google.com/app/apikey",
            isQuotaError: true
          },
          { status: 429 }
        );
      }
      throw apiError;
    }

    // Estimate output tokens
    const outputTokens = estimateTokens(aiResponse);

    // Save assistant message
    const assistantMessage = await saveMessage({
      session_id,
      role: "assistant",
      content: aiResponse,
      input_tokens: 0,
      output_tokens: outputTokens,
    });

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "Failed to save assistant message" },
        { status: 500 }
      );
    }

    // Calculate metrics for this exchange
    const totalTokens = inputTokens + outputTokens;
    const settings: Settings = {
      model_size: session.model_size,
      energy_mix: session.energy_mix,
      water_factor: session.water_factor,
    };

    const exchangeMetrics = calculateMetrics(totalTokens, settings);

    // Update session metrics (cumulative)
    const updatedMetrics = {
      total_tokens: session.total_tokens + totalTokens,
      energy_wh: session.energy_wh + exchangeMetrics.energy_wh,
      carbon_gco2: session.carbon_gco2 + exchangeMetrics.carbon_gco2,
      water_l: session.water_l + exchangeMetrics.water_l,
    };

    await updateSessionMetrics(session_id, updatedMetrics);

    return NextResponse.json({
      userMessage,
      assistantMessage,
      metrics: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        ...exchangeMetrics,
      },
      sessionMetrics: updatedMetrics,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}


