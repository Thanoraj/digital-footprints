import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For development without Supabase, create a dummy client
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Missing Supabase environment variables. Using mock client for development."
  );
  console.warn("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

// Create client with fallback values for development
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: false, // No auth in shared mode
    },
  }
);


