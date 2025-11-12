# Google AI API Key Setup

## Issue: Quota Exceeded

If you're seeing "quota exceeded" errors, it means your API key has hit the free tier limits.

## Solution 1: Wait (Quickest)

The free tier resets every minute. Wait 60 seconds and try again.

## Solution 2: Get a New API Key (Recommended)

### Step 1: Go to Google AI Studio
https://makersuite.google.com/app/apikey

### Step 2: Create New API Key
1. Click "Create API key"
2. Select your project or create new one
3. Copy the new key

### Step 3: Update .env.local
Replace your old key with the new one:

```env
GOOGLE_API_KEY=your_new_key_here
```

### Step 4: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Free Tier Limits

**Gemini 1.5 Flash** (current model):
- 15 requests per minute
- 1 million tokens per minute
- 1,500 requests per day

## Model Switched

The app now uses `gemini-1.5-flash` instead of `gemini-2.0-flash-exp` for better stability and higher limits.

## Upgrade to Paid Plan (Optional)

For production use with higher limits:
1. Go to https://console.cloud.google.com
2. Enable billing
3. Get much higher quotas

## Testing Without Real API

If you just want to test the UI without making real API calls, you can:
1. Click around the interface
2. View the metrics panel
3. Test session management
4. Try the settings

The quota error only affects sending actual messages to the AI.

---

**Quick Links:**
- Get API Key: https://makersuite.google.com/app/apikey
- Check Usage: https://ai.dev/usage
- Rate Limits Docs: https://ai.google.dev/gemini-api/docs/rate-limits


