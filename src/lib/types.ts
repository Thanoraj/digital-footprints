// Type definitions for Digital Footprints application

export type ModelSize = 
  | "Small (Demo)"
  | "Medium (GPT-3.5/Flash)"
  | "Large (GPT-4/Ultra)";

export type EnergyMix = 
  | "Renewables (Hydro/Solar)"
  | "Global Average Grid"
  | "US Average Grid"
  | "Coal-Powered Grid";

export interface Metrics {
  total_tokens: number;
  energy_wh: number;
  carbon_gco2: number;
  water_l: number;
}

export interface Settings {
  model_size: ModelSize;
  energy_mix: EnergyMix;
  water_factor: number;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  total_tokens: number;
  energy_wh: number;
  carbon_gco2: number;
  water_l: number;
  model_size: ModelSize;
  energy_mix: EnergyMix;
  water_factor: number;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

export interface MessageInput {
  session_id: string;
  role: "user" | "assistant";
  content: string;
  input_tokens?: number;
  output_tokens?: number;
}

export interface CalculatedMetrics {
  energy_wh: number;
  carbon_gco2: number;
  water_l: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface SessionsResponse {
  sessions: ChatSession[];
}

export interface MessagesResponse {
  messages: Message[];
}

export interface ChatResponse {
  message: Message;
  metrics: CalculatedMetrics;
}

export interface CreateSessionRequest {
  title?: string;
  model_size?: ModelSize;
  energy_mix?: EnergyMix;
  water_factor?: number;
}

export interface SendMessageRequest {
  session_id: string;
  content: string;
}

export interface UpdateSessionRequest {
  title?: string;
  model_size?: ModelSize;
  energy_mix?: EnergyMix;
  water_factor?: number;
}

// UI State Types
export interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface SettingsState extends Settings {
  isLoading: boolean;
}


