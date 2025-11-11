import streamlit as st
import time
import random
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from a .env file if available (useful for local development)
try:
    load_dotenv()
except:
    pass


# --- Helper Function for Token Estimation (Simple Proxy) ---
# Since we cannot easily access the underlying tokenizer for non-SDK models,
# we use a common, rough estimate: 1 token is approximately 4 characters of English text.
def estimate_tokens(text):
    """Estimates the token count based on string length."""
    if not text:
        return 0
    # Assuming rough average of 4 chars per token
    return max(1, len(text) // 4)


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
    layout="centered",
)

# --- Sidebar - The Dashboard ---
with st.sidebar:
    # st.image(
    #     "https://placehold.co/400x200/e2f0d1/4a7f09?text=AI+Environmental+Impact&font=inter",
    #     width="stretch",
    # )
    st.title("🍃 Digital Footprints")
    st.markdown(
        """
        This dashboard estimates the *cumulative* environmental
        footprint of your chat session in real-time, based on the **total number of tokens** processed.
        """
    )
    
    # MODIFIED: Initialize API Key ONLY from environment variable and remove input field.
    if "api_key" not in st.session_state:
        st.session_state.api_key = os.environ.get("GOOGLE_API_KEY", "")

    # Configure API and model
    if st.session_state.api_key:
        try:
            if "model" not in st.session_state:
                genai.configure(api_key=st.session_state.api_key)
                # Use a specific, stable model name
                st.session_state.model = genai.GenerativeModel('gemini-2.5-flash')
            
            if "chat" not in st.session_state:
                 # Initialize the chat session
                 st.session_state.chat = st.session_state.model.start_chat(history=[])
                 
            # st.success("API Configured Successfully!")
        except Exception as e:
            # Handle potential configuration failure even if key exists (e.g., key is invalid)
            st.error(f"Failed to configure API. Please ensure GOOGLE_API_KEY is valid. Error: {e}")
    else:
        # Show warning if the key is missing from the environment
        st.warning("Google AI API Key not found in environment variables. Chat functionality is disabled.")

    st.markdown("---") # Add a separator
    
    # Initialize session state for metrics
    if "metrics" not in st.session_state:
        st.session_state.metrics = {
            "queries": 0,
            "total_tokens": 0, # Track total tokens processed
            "energy_wh": 0.0,
            "carbon_gco2": 0.0,
            "water_l": 0.0,
        }

    # Metric Placeholders (Updated to include Tokens)
    col1, col2 = st.columns(2)
    queries_metric = col1.metric(label="Chat Messages", value=st.session_state.metrics["queries"])
    tokens_metric = col2.metric(label="Total Tokens", value=f"{st.session_state.metrics['total_tokens']:,.0f}")
    energy_metric = col1.metric(label="Energy Used (Wh)", value=f"{st.session_state.metrics['energy_wh']:.4f}") # Increased precision
    carbon_metric = col2.metric(label="Carbon Emitted (gCO2e)", value=f"{st.session_state.metrics['carbon_gco2']:.4f}") # Increased precision
    
    # Increased Water metric precision to 5 decimal places for visibility
    water_metric = st.metric(label="Water Used (Liters)", value=f"{st.session_state.metrics['water_l']:.5f}") 

    st.markdown("---")
    st.subheader("Model Assumptions (Per 1,000 Tokens)")
    st.markdown(
        """
        Energy cost is now proportional to the text length (token count).
        Try asking a short question vs. a long essay request!
        """
    )
    
    # Interactive "Knobs"
    model_size_key = "model_size"
    model_size = st.select_slider(
        "Select AI Model Size",
        options=ENERGY_PER_KILOTOKEN_WH.keys(), # Changed constant reference
        value="Medium (GPT-3.5/Flash)",
        key=model_size_key,
    )
    
    energy_mix_key = "energy_mix"
    energy_mix = st.select_slider(
        "Data Center Energy Mix",
        options=CARBON_INTENSITY_G_PER_KWH.keys(),
        value="US Average Grid",
        key=energy_mix_key,
    )
    
    water_factor_key = "water_factor"
    water_factor = st.number_input(
        "Water Cooling Efficiency (L/kWh)",
        min_value=0.0,
        max_value=5.0,
        value=DEFAULT_WATER_L_PER_KWH,
        step=0.1,
        key=water_factor_key,
    )

# --- Main Chat Interface ---
st.title("Digital Footprints 💬") # MODIFIED: Changed app name
st.markdown(
    """
    Welcome! This is a standard chatbot, but with one difference.
    
    Look at the **dashboard in the sidebar**. With every message you send,
    it calculates the *estimated* environmental cost based on the total 
    number of tokens used (input + output).
    
    Try a very short query, and then try asking for a 500-word essay
    to see how dramatically the energy consumption increases!
    """
)

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Accept user input
if prompt := st.chat_input("What's on your mind?"):
    # 1. Estimate Input Tokens BEFORE generating response
    input_tokens = estimate_tokens(prompt)
    
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Display user message in chat message container
    with st.chat_message("user"):
        st.markdown(prompt)

    # --- Generate Bot Response with Gemini ---
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
                
                # Send prompt to Gemini
                with st.spinner("Generating response..."):
                    # Use the chat session to send the message
                    response = st.session_state.chat.send_message(prompt, stream=True)
                    
                full_response = ""
                # Stream the response
                for chunk in response:
                    # Handle cases where chunk.text might be empty or raise errors
                    try:
                        full_response += chunk.text
                        message_placeholder.markdown(full_response + "▌")
                    except ValueError:
                        # Handle potential value errors during streaming
                        time.sleep(0.1) 
                        continue
                message_placeholder.markdown(full_response)
            
            # 2. Estimate Output Tokens AFTER generating response
            output_tokens = estimate_tokens(full_response)
            
            # Add assistant response to chat history
            st.session_state.messages.append({"role": "assistant", "content": full_response})

        except Exception as e:
            st.error(f"An error occurred while generating the response: {e}")
            st.session_state.messages.append({"role": "assistant", "content": f"Error: {e}"})
            output_tokens = 0
            
    # --- THIS IS THE KEY STEP ---
    # Update the cumulative dashboard metrics and get individual metrics back
    last_energy, last_carbon, last_water = update_metrics(
        st.session_state[model_size_key],
        st.session_state[energy_mix_key],
        st.session_state[water_factor_key],
        input_tokens,
        output_tokens,
    )
    
    # Update the dashboard display (needs to be explicitly called again since we are outside the sidebar context)
    queries_metric.metric(label="Chat Messages", value=st.session_state.metrics["queries"])
    tokens_metric.metric(label="Total Tokens", value=f"{st.session_state.metrics['total_tokens']:,.0f}")
    energy_metric.metric(label="Energy Used (Wh)", value=f"{st.session_state.metrics['energy_wh']:.4f}")
    carbon_metric.metric(label="Carbon Emitted (gCO2e)", value=f"{st.session_state.metrics['carbon_gco2']:.4f}")
    water_metric.metric(label="Water Used (Liters)", value=f"{st.session_state.metrics['water_l']:.5f}") 
    
    # --- Display Last Query Impact Card (MODIFIED) ---
    st.markdown("---")
    # MODIFIED: Removed subheader and verbose description, replacing with a simple, clean label
    st.markdown("#### Environmental Cost for this Exchange:") 

    # Use st.columns for a visually appealing card
    col_input, col_output, col_energy, col_carbon, col_water = st.columns(5)

    # Input/Output Tokens
    col_input.metric("Input Tokens", f"{input_tokens:,.0f}")
    col_output.metric("Output Tokens", f"{output_tokens:,.0f}")

    # Environmental Costs
    col_energy.metric("Energy (Wh)", f"{last_energy:.4f}")
    col_carbon.metric("Carbon (gCO2e)", f"{last_carbon:.4f}")
    col_water.metric("Water (Liters)", f"{last_water:.5f}")