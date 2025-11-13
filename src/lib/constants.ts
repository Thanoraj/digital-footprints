// Environmental impact calculation constants

import type { ModelSize, EnergyMix } from "./types";

/**
 * Energy consumption per 1000 tokens (kilotoken) in Watt-hours
 * Based on academic research and industry estimates
 */
export const ENERGY_PER_KILOTOKEN_WH: Record<ModelSize, number> = {
  "Small (Demo)": 0.005,
  "Medium (GPT-3.5/Flash)": 0.025,
  "Large (GPT-4/Ultra)": 0.09,
};

/**
 * Carbon intensity by energy grid mix in grams CO2e per kWh
 * Sources: IEA, EPA, and regional energy reports
 */
export const CARBON_INTENSITY_G_PER_KWH: Record<EnergyMix, number> = {
  "Renewables (Hydro/Solar)": 20,
  "Global Average Grid": 450,
  "US Average Grid": 400,
  "Coal-Powered Grid": 820,
};

/**
 * Default water usage factor for data center cooling
 * Based on Google's 2023 environmental report: 1.1 L/kWh
 */
export const DEFAULT_WATER_L_PER_KWH = 1.1;

/**
 * Token estimation: approximate characters per token
 * Rough estimate used when precise tokenization is unavailable
 */
export const CHARS_PER_TOKEN = 4;

/**
 * Default model settings
 */
export const DEFAULT_MODEL_SIZE: ModelSize = "Medium (GPT-3.5/Flash)";
export const DEFAULT_ENERGY_MIX: EnergyMix = "US Average Grid";
export const DEFAULT_WATER_FACTOR = DEFAULT_WATER_L_PER_KWH;

/**
 * UI Constants
 */
export const APP_NAME = "Ecomate";
export const APP_DESCRIPTION = "Track the environmental impact of your AI conversations";
export const APP_VERSION = "2.0.0";

/**
 * Gemini AI Model Configuration
 * Using gemini-1.5-flash for better free tier limits
 */
export const GEMINI_MODEL = "gemini-2.0-flash-exp";
export const GEMINI_MAX_TOKENS = 8192;

/**
 * Session limits
 */
export const MAX_SESSION_TITLE_LENGTH = 50;
export const MAX_MESSAGE_LENGTH = 10000;


