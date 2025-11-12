# Digital Footprints 🍃

A Streamlit application that visualizes the environmental impact of AI chat interactions in real-time, tracking energy consumption, carbon emissions, and water usage with persistent chat history.

## Features

- **Real-time Environmental Tracking**: Monitor energy, carbon, and water consumption as you chat
- **Persistent Chat History**: All conversations are saved to Supabase and persist across app restarts
- **3-Column Layout**:
  - Left: Chat history with message previews
  - Middle: Active chat interface
  - Right: Environmental metrics dashboard with adjustable settings
- **Shared Chat History**: All users see the same chat history (global shared mode)
- **Token-based Calculations**: Environmental impact scales with actual token usage
- **Customizable Assumptions**: Adjust model size, energy mix, and water efficiency

## Architecture

- **Frontend**: Streamlit (Python)
- **AI Model**: Google Gemini 2.5 Flash
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Streamlit Cloud (free tier)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd digital-footprints
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```
GOOGLE_API_KEY=your_google_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

**Getting API Keys:**

- **Google AI API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Supabase**: Sign up at [Supabase](https://supabase.com), create a project, and get credentials from Project Settings > API

### 4. Set Up Supabase Database

Follow the detailed instructions in [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) to create the required tables.

Quick version - run this SQL in Supabase SQL Editor:

```sql
-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Session state table
CREATE TABLE session_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queries_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    energy_wh DOUBLE PRECISION DEFAULT 0.0,
    carbon_gco2 DOUBLE PRECISION DEFAULT 0.0,
    water_l DOUBLE PRECISION DEFAULT 0.0,
    model_size TEXT DEFAULT 'Medium (GPT-3.5/Flash)',
    energy_mix TEXT DEFAULT 'US Average Grid',
    water_factor DOUBLE PRECISION DEFAULT 1.1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and create permissive policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on messages" ON messages
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on session_state" ON session_state
FOR ALL USING (true) WITH CHECK (true);
```

### 5. Run the Application

```bash
streamlit run app.py
```

The app will open at `http://localhost:8501`

## Deployment to Streamlit Cloud

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

### Step 2: Deploy on Streamlit Cloud

1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Sign in with GitHub
3. Click "New app"
4. Select your repository, branch (`main`), and main file (`app.py`)
5. Click "Advanced settings"
6. In the "Secrets" section, add:

```toml
GOOGLE_API_KEY = "your_google_api_key_here"
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your_supabase_anon_key_here"
```

7. Click "Deploy"

### Step 3: Verify Deployment

1. Wait for deployment to complete (usually 2-3 minutes)
2. Open your app
3. Send a test message
4. Check Supabase Table Editor to verify data is being saved
5. Restart the app (Reboot) to verify chat history persists

## Project Structure

```
digital-footprints/
├── app.py                  # Main Streamlit application
├── requirements.txt        # Python dependencies
├── README_SETUP.md        # This file
├── SUPABASE_SETUP.md      # Database setup guide
├── readme.md              # Environmental methodology
└── .gitignore             # Git ignore rules
```

## How It Works

### Environmental Impact Calculation

The app uses token-based calculations for environmental impact:

1. **Energy (Wh)** = (Total Tokens / 1000) × Energy per Kilotoken
2. **Carbon (gCO2e)** = Energy (kWh) × Carbon Intensity
3. **Water (L)** = Energy (kWh) × Water Usage Factor

See [`readme.md`](readme.md) for detailed methodology.

### Database Persistence

- **Chat Messages**: Stored in `messages` table with timestamps and token counts
- **Session State**: Metrics and settings stored in `session_state` table
- **Shared Mode**: All users interact with the same database (no user isolation)
- **Auto-sync**: Data is loaded on startup and saved after each interaction

### Layout

The app uses a 3-column layout:

- **Left Column (25%)**: Scrollable chat history with message previews
- **Middle Column (50%)**: Active chat interface with message input
- **Right Column (25%)**: Environmental metrics and settings panel

## Configuration

### Environmental Settings

Adjust these in the right sidebar:

- **AI Model Size**: Small/Medium/Large (affects energy per token)
- **Energy Mix**: Renewables to Coal (affects carbon intensity)
- **Water Efficiency**: 0-5 L/kWh (affects water usage)

Settings are persisted to the database and shared across all users.

## Troubleshooting

### Chat history not persisting

- Verify Supabase credentials in secrets/environment
- Check Supabase logs for errors
- Ensure RLS policies are configured correctly

### API errors

- Verify `GOOGLE_API_KEY` is valid
- Check Google AI Studio for API quota
- Ensure the Gemini model is available in your region

### Database connection issues

- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check Supabase project status
- Review network/firewall settings

### Layout issues

- Clear browser cache
- Check browser console for JavaScript errors
- Verify you're using a modern browser (Chrome, Firefox, Safari, Edge)

## Development Notes

### Key Dependencies

- `streamlit>=1.28.0`: Web framework
- `google-generativeai>=0.8.0`: Google Gemini API client
- `supabase>=2.0.0`: Supabase client for database operations
- `python-dotenv>=1.0.0`: Environment variable management

### Database Schema

**messages table:**
- Stores individual chat messages
- Tracks input/output tokens per message
- Ordered by creation timestamp

**session_state table:**
- Single-row table storing cumulative metrics
- Tracks total queries, tokens, energy, carbon, water
- Stores current settings (model size, energy mix, water factor)

## Future Enhancements

- User authentication and per-user chat history
- Export chat history as PDF/JSON
- Advanced analytics and charts
- Comparison with other activities (driving, streaming video)
- Integration with carbon offset services
- Multi-language support

## Contributing

Feel free to open issues or submit pull requests for:
- Bug fixes
- Feature enhancements
- Documentation improvements
- UI/UX improvements

## License

This project is for educational and awareness purposes.

## Acknowledgments

- Environmental impact methodology based on research by Luccioni et al. and Google's environmental reports
- Built with Streamlit, Google Gemini, and Supabase

