import streamlit as st
import time
import random
import google.generativeai as genai
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime
from typing import Optional, Dict, List, Any

# Load environment variables from a .env file if available (useful for local development)
try:
    load_dotenv()
except:
    pass

# --- Supabase Configuration ---
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# Initialize Supabase client
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        st.error(f"Failed to initialize Supabase: {e}")
        supabase = None


# --- Helper Function for Token Estimation (Simple Proxy) ---
# Since we cannot easily access the underlying tokenizer for non-SDK models,
# we use a common, rough estimate: 1 token is approximately 4 characters of English text.
def estimate_tokens(text):
    """Estimates the token count based on string length."""
    if not text:
        return 0
    # Assuming rough average of 4 chars per token
    return max(1, len(text) // 4)


# --- Database Helper Functions ---
def load_chat_sessions() -> List[Dict[str, Any]]:
    """Load all chat sessions from Supabase, ordered by most recent."""
    if not supabase:
        return []
    
    try:
        response = supabase.table("chat_sessions").select("*").order("updated_at", desc=True).execute()
        sessions = response.data if response.data else []
        print(f"Loaded {len(sessions)} chat sessions from database")
        return sessions
    except Exception as e:
        error_msg = str(e)
        print(f"Error loading chat sessions: {error_msg}")
        # Try to get more specific error info
        if hasattr(e, '__dict__'):
            print(f"Error details: {e.__dict__}")
        return []


def create_chat_session(title: str = "New Chat") -> Optional[str]:
    """Create a new chat session and return its ID."""
    if not supabase:
        return None
    
    try:
        data = {
            "title": title,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("chat_sessions").insert(data).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]["id"]
        return None
    except Exception as e:
        print(f"Error creating chat session: {e}")
        return None


def update_session_timestamp(session_id: str) -> bool:
    """Update the session's updated_at timestamp."""
    if not supabase or not session_id:
        return False
    
    try:
        data = {"updated_at": datetime.utcnow().isoformat()}
        supabase.table("chat_sessions").update(data).eq("id", session_id).execute()
        return True
    except Exception as e:
        print(f"Error updating session timestamp: {e}")
        return False


def update_session_title(session_id: str, title: str) -> bool:
    """Update the session title."""
    if not supabase or not session_id:
        return False
    
    try:
        data = {"title": title}
        supabase.table("chat_sessions").update(data).eq("id", session_id).execute()
        return True
    except Exception as e:
        print(f"Error updating session title: {e}")
        return False


def load_chat_history(session_id: str) -> List[Dict[str, Any]]:
    """Load chat messages for a specific session from Supabase."""
    if not supabase or not session_id:
        return []
    
    try:
        response = supabase.table("messages").select("*").eq("session_id", session_id).order("created_at", desc=False).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error loading chat history: {e}")
        return []


def save_message(session_id: str, role: str, content: str, input_tokens: int = 0, output_tokens: int = 0) -> bool:
    """Save a single message to Supabase."""
    if not supabase or not session_id:
        return False
    
    try:
        data = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("messages").insert(data).execute()
        
        # Update session timestamp
        update_session_timestamp(session_id)
        
        return True
    except Exception as e:
        print(f"Error saving message: {e}")
        return False


def delete_chat_session(session_id: str) -> bool:
    """Delete a chat session (messages will be cascade deleted)."""
    if not supabase or not session_id:
        return False
    
    try:
        supabase.table("chat_sessions").delete().eq("id", session_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting session: {e}")
        return False


def load_session_state_from_db() -> Optional[Dict[str, Any]]:
    """Load session state (metrics and settings) from Supabase."""
    if not supabase:
        return None
    
    try:
        response = supabase.table("session_state").select("*").limit(1).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error loading session state: {e}")
        return None


def save_session_state_to_db(metrics: Dict[str, Any], model_size: str, energy_mix: str, water_factor: float) -> bool:
    """Save or update session state to Supabase."""
    if not supabase:
        return False
    
    try:
        data = {
            "queries_count": metrics["queries"],
            "total_tokens": metrics["total_tokens"],
            "energy_wh": metrics["energy_wh"],
            "carbon_gco2": metrics["carbon_gco2"],
            "water_l": metrics["water_l"],
            "model_size": model_size,
            "energy_mix": energy_mix,
            "water_factor": water_factor,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Check if a row exists
        existing = supabase.table("session_state").select("id").limit(1).execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing row
            supabase.table("session_state").update(data).eq("id", existing.data[0]["id"]).execute()
        else:
            # Insert new row
            supabase.table("session_state").insert(data).execute()
        
        return True
    except Exception as e:
        print(f"Error saving session state: {e}")
        return False


def initialize_session_state_in_db() -> bool:
    """Initialize session state in database if it doesn't exist."""
    if not supabase:
        return False
    
    try:
        existing = supabase.table("session_state").select("id").limit(1).execute()
        if not existing.data or len(existing.data) == 0:
            data = {
                "queries_count": 0,
                "total_tokens": 0,
                "energy_wh": 0.0,
                "carbon_gco2": 0.0,
                "water_l": 0.0,
                "model_size": "Medium (GPT-3.5/Flash)",
                "energy_mix": "US Average Grid",
                "water_factor": 1.1,
                "updated_at": datetime.utcnow().isoformat()
            }
            supabase.table("session_state").insert(data).execute()
        return True
    except Exception as e:
        print(f"Error initializing session state: {e}")
        return False


# --- Constants for Calculation ---
# 1. Energy (Wh) per KILOTOKEN (1000 tokens) based on model size
ENERGY_PER_KILOTOKEN_WH = {
    "Small (Demo)": 0.005,  # e.g., an extremely efficient or specialized model
    "Medium (GPT-3.5/Flash)": 0.025, # Standard efficient model
    "Large (GPT-4/Ultra)": 0.09, # Larger, more complex model
}

# 2. Carbon Intensity (gCO2e / kWh) based on energy grid
CARBON_INTENSITY_G_PER_KWH = {
    "Renewables (Hydro/Solar)": 20,
    "Global Average Grid": 450,
    "US Average Grid": 400,
    "Coal-Powered Grid": 820,
}

# 3. Water Usage (Liters / kWh) for data center cooling
DEFAULT_WATER_L_PER_KWH = 1.1

# --- Helper Function ---
def update_metrics(model_size, energy_mix, water_factor, input_tokens, output_tokens):
    """
    Calculates the environmental cost based on total tokens processed, adds it
    to the session state totals, and returns the calculated values for the last query card.
    """
    try:
        total_tokens = input_tokens + output_tokens
        kilotokens = total_tokens / 1000.0
        
        # 1. Calculate Energy
        # We use Wh per kToken
        energy_per_ktoken_wh = ENERGY_PER_KILOTOKEN_WH.get(model_size, 0.025)
        energy_wh = kilotokens * energy_per_ktoken_wh
        
        # 2. Calculate Carbon
        carbon_intensity = CARBON_INTENSITY_G_PER_KWH.get(energy_mix, 400)
        # Convert Wh to kWh for calculation
        energy_kwh = energy_wh / 1000.0
        carbon_gco2 = energy_kwh * carbon_intensity
        
        # 3. Calculate Water
        water_l = energy_kwh * water_factor
        
        # 4. Update session state (Cumulative)
        st.session_state.metrics["queries"] += 1
        st.session_state.metrics["total_tokens"] += total_tokens
        st.session_state.metrics["energy_wh"] += energy_wh
        st.session_state.metrics["carbon_gco2"] += carbon_gco2
        st.session_state.metrics["water_l"] += water_l
        
        # Return individual metrics for the card display
        return energy_wh, carbon_gco2, water_l
        
    except Exception as e:
        print(f"Error in update_metrics: {e}")
        return 0, 0, 0


# --- App Configuration ---
st.set_page_config(
    page_title="Digital Footprints", # MODIFIED: Changed app name
    page_icon="🍃",
    layout="wide",
)

# --- Initialize Database and Load Persisted Data ---
if supabase:
    initialize_session_state_in_db()

# MODIFIED: Initialize API Key ONLY from environment variable
if "api_key" not in st.session_state:
    st.session_state.api_key = os.environ.get("GOOGLE_API_KEY", "")

# Configure API and model
if st.session_state.api_key:
    try:
        if "model" not in st.session_state:
            genai.configure(api_key=st.session_state.api_key)
            st.session_state.model = genai.GenerativeModel('gemini-2.5-flash')
        
        if "chat" not in st.session_state:
            st.session_state.chat = st.session_state.model.start_chat(history=[])
    except Exception as e:
        st.error(f"Failed to configure API. Please ensure GOOGLE_API_KEY is valid. Error: {e}")

# Initialize session state for metrics from database or defaults
if "metrics" not in st.session_state:
    db_state = load_session_state_from_db()
    if db_state:
        st.session_state.metrics = {
            "queries": db_state.get("queries_count", 0),
            "total_tokens": db_state.get("total_tokens", 0),
            "energy_wh": float(db_state.get("energy_wh", 0.0)),
            "carbon_gco2": float(db_state.get("carbon_gco2", 0.0)),
            "water_l": float(db_state.get("water_l", 0.0)),
        }
    else:
        st.session_state.metrics = {
            "queries": 0,
            "total_tokens": 0,
            "energy_wh": 0.0,
            "carbon_gco2": 0.0,
            "water_l": 0.0,
        }

# Initialize chat sessions
if "chat_sessions" not in st.session_state:
    st.session_state.chat_sessions = load_chat_sessions()

# Initialize current session ID (always set to ensure it exists)
if "current_session_id" not in st.session_state:
    st.session_state.current_session_id = None
    
    # Try to load existing sessions
    if st.session_state.chat_sessions:
        # Use the most recent session
        st.session_state.current_session_id = st.session_state.chat_sessions[0]["id"]
    elif supabase:
        # Create a new session if none exist
        new_session_id = create_chat_session("New Chat")
        if new_session_id:
            st.session_state.current_session_id = new_session_id
            st.session_state.chat_sessions = load_chat_sessions()

# Load chat history for current session
if "messages" not in st.session_state:
    if st.session_state.current_session_id:
        db_messages = load_chat_history(st.session_state.current_session_id)
        st.session_state.messages = [
            {"role": msg["role"], "content": msg["content"]} 
            for msg in db_messages
        ]
    else:
        st.session_state.messages = []

# Load settings from database or use defaults
if "settings_loaded" not in st.session_state:
    db_state = load_session_state_from_db()
    if db_state:
        if "model_size" not in st.session_state:
            st.session_state.model_size = db_state.get("model_size", "Medium (GPT-3.5/Flash)")
        if "energy_mix" not in st.session_state:
            st.session_state.energy_mix = db_state.get("energy_mix", "US Average Grid")
        if "water_factor" not in st.session_state:
            st.session_state.water_factor = float(db_state.get("water_factor", DEFAULT_WATER_L_PER_KWH))
    st.session_state.settings_loaded = True

# --- Sidebar: Chat Sessions ---
with st.sidebar:
    st.title("🍃 Digital Footprints")
    
    col_new, col_refresh = st.columns([3, 1])
    
    with col_new:
        # New Chat button
        if st.button("➕ New Chat", use_container_width=True, type="primary"):
            if supabase:
                new_session_id = create_chat_session("New Chat")
                if new_session_id:
                    st.session_state.current_session_id = new_session_id
                    st.session_state.messages = []
                    st.session_state.chat_sessions = load_chat_sessions()
                    # Reset Gemini chat
                    if "model" in st.session_state:
                        st.session_state.chat = st.session_state.model.start_chat(history=[])
                    st.rerun()
            else:
                st.warning("Database not connected. Cannot create new session.")
    
    with col_refresh:
        # Refresh button
        if st.button("🔄", use_container_width=True, help="Refresh sessions"):
            st.session_state.chat_sessions = load_chat_sessions()
            st.rerun()
    
    st.markdown("---")
    st.subheader("💬 Chat Sessions")
    
    # Debug info (remove after testing)
    if st.session_state.get("chat_sessions") is not None:
        st.caption(f"Sessions loaded: {len(st.session_state.chat_sessions)}")
    if st.session_state.get("current_session_id"):
        st.caption(f"Current: {st.session_state.current_session_id[:8]}...")
    
    if not supabase:
        st.warning("⚠️ Database not connected. Sessions will not persist.")
    
    # Display chat sessions
    if st.session_state.chat_sessions and len(st.session_state.chat_sessions) > 0:
        for session in st.session_state.chat_sessions:
            session_id = session["id"]
            session_title = session.get("title", "New Chat")
            
            # Highlight current session
            is_current = (st.session_state.get("current_session_id") == session_id)
            
            col1, col2 = st.columns([4, 1])
            
            with col1:
                # Session button
                if st.button(
                    f"{'🔹' if is_current else '💬'} {session_title}",
                    key=f"session_{session_id}",
                    use_container_width=True,
                    disabled=is_current
                ):
                    # Switch to this session
                    st.session_state.current_session_id = session_id
                    st.session_state.messages = [
                        {"role": msg["role"], "content": msg["content"]} 
                        for msg in load_chat_history(session_id)
                    ]
                    # Reset Gemini chat for new session
                    if "model" in st.session_state:
                        st.session_state.chat = st.session_state.model.start_chat(history=[])
                    st.rerun()
            
            with col2:
                # Delete button
                if not is_current and st.button("🗑️", key=f"delete_{session_id}"):
                    if delete_chat_session(session_id):
                        st.session_state.chat_sessions = load_chat_sessions()
                        st.rerun()
    else:
        if supabase:
            st.info("No chat sessions yet. Click 'New Chat' to start!")
        else:
            st.warning("⚠️ Database not connected. Cannot load sessions.")

# --- Main Layout: 2 Columns ---
st.title("💬 Chat")

col_chat, col_metrics = st.columns([2, 1])

# === LEFT COLUMN: Active Chat ===
with col_chat:
    st.markdown(
        """
        Ask questions and see the environmental impact in real-time!
        Try a short query vs. a long essay request to see the difference.
        """
    )
    
    if not st.session_state.api_key:
        st.warning("⚠️ Google AI API Key not found. Set GOOGLE_API_KEY environment variable.")
    
    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

# Chat input MUST be outside columns
if prompt := st.chat_input("What's on your mind?"):
    # Estimate Input Tokens
    input_tokens = estimate_tokens(prompt)
    
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Save to database
    if st.session_state.current_session_id:
        save_message(st.session_state.current_session_id, "user", prompt, input_tokens=input_tokens)
        
        # Auto-generate title from first user message
        if len(st.session_state.messages) == 1:
            title = prompt[:50] + "..." if len(prompt) > 50 else prompt
            update_session_title(st.session_state.current_session_id, title)
            st.session_state.chat_sessions = load_chat_sessions()
    
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Generate Bot Response
    if not st.session_state.api_key:
        with st.chat_message("assistant"):
            st.warning("Chat is disabled. Please set the GOOGLE_API_KEY environment variable.")
        output_tokens = 0
        full_response = ""
    elif "chat" not in st.session_state:
        with st.chat_message("assistant"):
            st.warning("API not configured. Please ensure your API key is valid.")
        output_tokens = 0
        full_response = ""
    else:
        try:
            with st.chat_message("assistant"):
                message_placeholder = st.empty()
                
                with st.spinner("Generating response..."):
                    response = st.session_state.chat.send_message(prompt, stream=True)
                    
                full_response = ""
                for chunk in response:
                    try:
                        full_response += chunk.text
                        message_placeholder.markdown(full_response + "▌")
                    except ValueError:
                        time.sleep(0.1) 
                        continue
                message_placeholder.markdown(full_response)
            
            output_tokens = estimate_tokens(full_response)
            st.session_state.messages.append({"role": "assistant", "content": full_response})
            
            # Save to database
            if st.session_state.current_session_id:
                save_message(st.session_state.current_session_id, "assistant", full_response, output_tokens=output_tokens)
            
        except Exception as e:
            st.error(f"An error occurred while generating the response: {e}")
            error_msg = f"Error: {e}"
            st.session_state.messages.append({"role": "assistant", "content": error_msg})
            if st.session_state.current_session_id:
                save_message(st.session_state.current_session_id, "assistant", error_msg)
            output_tokens = 0
    
    # Update metrics
    last_energy, last_carbon, last_water = update_metrics(
        st.session_state.model_size,
        st.session_state.energy_mix,
        st.session_state.water_factor,
        input_tokens,
        output_tokens,
    )
    
    # Save updated state to database
    save_session_state_to_db(
        st.session_state.metrics,
        st.session_state.model_size,
        st.session_state.energy_mix,
        st.session_state.water_factor
    )
    
    # Display last query impact
    st.markdown("---")
    st.markdown("#### Environmental Cost for this Exchange:")
    
    impact_cols = st.columns(5)
    impact_cols[0].metric("Input Tokens", f"{input_tokens:,.0f}")
    impact_cols[1].metric("Output Tokens", f"{output_tokens:,.0f}")
    impact_cols[2].metric("Energy (Wh)", f"{last_energy:.4f}")
    impact_cols[3].metric("Carbon (gCO2e)", f"{last_carbon:.4f}")
    impact_cols[4].metric("Water (Liters)", f"{last_water:.5f}")
    
    st.rerun()

# === RIGHT COLUMN: Environmental Metrics Dashboard ===
with col_metrics:
    st.subheader("📊 Environmental Impact")
    st.markdown(
        """
        Cumulative environmental footprint based on total tokens processed.
        """
    )
    st.markdown("---")
    
    # Display metrics
    st.metric(label="Chat Messages", value=st.session_state.metrics["queries"])
    st.metric(label="Total Tokens", value=f"{st.session_state.metrics['total_tokens']:,.0f}")
    st.metric(label="Energy Used (Wh)", value=f"{st.session_state.metrics['energy_wh']:.4f}")
    st.metric(label="Carbon Emitted (gCO2e)", value=f"{st.session_state.metrics['carbon_gco2']:.4f}")
    st.metric(label="Water Used (Liters)", value=f"{st.session_state.metrics['water_l']:.5f}")
    
    st.markdown("---")
    st.subheader("⚙️ Settings")
    st.markdown("*Per 1,000 Tokens*")
    
    # Model assumptions controls
    model_size = st.select_slider(
        "AI Model Size",
        options=list(ENERGY_PER_KILOTOKEN_WH.keys()),
        value=st.session_state.get("model_size", "Medium (GPT-3.5/Flash)"),
        key="model_size",
    )
    
    energy_mix = st.select_slider(
        "Energy Mix",
        options=list(CARBON_INTENSITY_G_PER_KWH.keys()),
        value=st.session_state.get("energy_mix", "US Average Grid"),
        key="energy_mix",
    )
    
    water_factor = st.number_input(
        "Water Efficiency (L/kWh)",
        min_value=0.0,
        max_value=5.0,
        value=st.session_state.get("water_factor", DEFAULT_WATER_L_PER_KWH),
        step=0.1,
        key="water_factor",
    )
    
    # Save settings when changed
    if supabase:
        save_session_state_to_db(
            st.session_state.metrics,
            model_size,
            energy_mix,
            water_factor
        )