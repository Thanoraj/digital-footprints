import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ModelSize, EnergyMix, CalculatedMetrics, Settings } from "./types";
import {
  ENERGY_PER_KILOTOKEN_WH,
  CARBON_INTENSITY_G_PER_KWH,
  CHARS_PER_TOKEN,
} from "./constants";

/**
 * Utility for merging Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Estimates token count from text string
 * Uses a simple character-based approximation
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Assuming rough average of 4 characters per token
  return Math.max(1, Math.floor(text.length / CHARS_PER_TOKEN));
}

/**
 * Calculates environmental metrics based on token usage
 * @param totalTokens - Combined input and output tokens
 * @param settings - Model size, energy mix, and water factor settings
 * @returns Calculated energy, carbon, and water metrics
 */
export function calculateMetrics(
  totalTokens: number,
  settings: Settings
): CalculatedMetrics {
  const kilotokens = totalTokens / 1000.0;

  // 1. Calculate Energy (Wh)
  const energyPerKilotoken = ENERGY_PER_KILOTOKEN_WH[settings.model_size] || 0.025;
  const energy_wh = kilotokens * energyPerKilotoken;

  // 2. Calculate Carbon (gCO2e)
  const carbonIntensity = CARBON_INTENSITY_G_PER_KWH[settings.energy_mix] || 400;
  const energy_kwh = energy_wh / 1000.0;
  const carbon_gco2 = energy_kwh * carbonIntensity;

  // 3. Calculate Water (Liters)
  const water_l = energy_kwh * settings.water_factor;

  return {
    energy_wh,
    carbon_gco2,
    water_l,
  };
}

/**
 * Formats a number with commas for thousands
 */
export function formatNumber(num: number | undefined | null, decimals: number = 0): string {
  // Handle undefined, null, or NaN
  if (num === undefined || num === null || isNaN(num)) {
    return (0).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Truncates text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Generates a title from the first user message
 */
export function generateSessionTitle(firstMessage: string, maxLength: number = 50): string {
  return truncateText(firstMessage, maxLength);
}

/**
 * Validates environment variables
 */
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "GOOGLE_API_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
