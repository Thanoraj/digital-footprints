# Deployment Checklist for Streamlit Cloud

Follow these steps to deploy Ecomate to Streamlit Cloud for free.

## Pre-Deployment Checklist

- [ ] **Supabase account created** at [supabase.com](https://supabase.com)
- [ ] **Supabase project created**
- [ ] **Database tables created** (see SUPABASE_SETUP.md)
- [ ] **Google AI API key obtained** from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] **Code pushed to GitHub repository**

## Step-by-Step Deployment

### 1. Set Up Supabase (5 minutes)

```
✓ Create free Supabase account
✓ Create new project (wait for provisioning ~2 min)
✓ Go to SQL Editor
✓ Copy and run SQL from SUPABASE_SETUP.md
✓ Verify tables created in Table Editor
✓ Copy SUPABASE_URL from Settings > API
✓ Copy SUPABASE_KEY (anon/public) from Settings > API
```

### 2. Get API Keys

```
✓ GOOGLE_API_KEY from Google AI Studio
✓ SUPABASE_URL from your Supabase project
✓ SUPABASE_KEY (anon public key) from your Supabase project
```

### 3. Push Code to GitHub

```bash
# If not already done
git add .
git commit -m "Add Supabase integration and 3-column layout"
git push origin main
```

### 4. Deploy to Streamlit Cloud

```
✓ Go to https://share.streamlit.io
✓ Sign in with GitHub
✓ Click "New app"
✓ Select:
  - Repository: your-username/digital-footprints
  - Branch: main
  - Main file path: app.py
✓ Click "Advanced settings"
✓ Add secrets (see format below)
✓ Click "Deploy"
```

**Secrets Format (TOML):**

```toml
GOOGLE_API_KEY = "your_google_api_key_here"
SUPABASE_URL = "https://xxxxx.supabase.co"
SUPABASE_KEY = "your_supabase_anon_key_here"
```

### 5. Verify Deployment

```
✓ Wait for deployment (2-3 minutes)
✓ Open your app URL
✓ Verify layout shows 3 columns
✓ Send a test message
✓ Check response appears
✓ Check environmental metrics update
```

### 6. Verify Persistence

```
✓ Go to Supabase > Table Editor
✓ Check messages table has your test message
✓ Check session_state table has metrics
✓ In Streamlit app, click "⋮" menu > "Reboot app"
✓ Wait for app to restart
✓ Verify chat history reappears
✓ Verify metrics are maintained
```

## Post-Deployment

### Monitor Your App

- **App URL**: `https://[your-app].streamlit.app`
- **Streamlit Dashboard**: Monitor logs and usage at share.streamlit.io
- **Supabase Dashboard**: Monitor database usage and queries

### Update Secrets

To update environment variables after deployment:

1. Go to share.streamlit.io
2. Open your app settings
3. Click on the three dots ⋮ > Settings
4. Update secrets in the Secrets section
5. Click "Save"
6. App will automatically restart

### Manage App

**Reboot app:**
- From share.streamlit.io dashboard
- Or from app UI: ⋮ menu > Reboot app

**Update code:**
```bash
git add .
git commit -m "Your update message"
git push origin main
# App auto-deploys on push
```

**View logs:**
- Click "Manage app" in share.streamlit.io
- View "Logs" section for errors

## Common Issues & Solutions

### Issue: "Database not connected" warning

**Solution:**
- Check secrets are correctly set in Streamlit Cloud
- Verify SUPABASE_URL format: `https://xxxxx.supabase.co`
- Verify SUPABASE_KEY is the anon/public key (not service role key)
- Check Supabase project is active (not paused)

### Issue: Chat history not persisting

**Solution:**
- Verify tables created in Supabase
- Check RLS policies allow operations
- View Streamlit logs for database errors
- Test database connection in Supabase SQL Editor

### Issue: "Failed to configure API" error

**Solution:**
- Verify GOOGLE_API_KEY is correct
- Check Google AI Studio for API restrictions
- Ensure Gemini API is enabled for your project
- Check API quota hasn't been exceeded

### Issue: Layout looks broken

**Solution:**
- Clear browser cache
- Try different browser
- Check browser console for JavaScript errors
- Verify app.py has `layout="wide"` in set_page_config

## Maintenance

### Reset Database (Clear All Data)

If you want to start fresh:

```sql
-- Run in Supabase SQL Editor
TRUNCATE TABLE messages;
TRUNCATE TABLE session_state;
```

Then reboot your Streamlit app.

### Monitor Resource Usage

**Streamlit Cloud Free Tier:**
- 1 GB RAM
- Unlimited apps (1 private)
- Community support

**Supabase Free Tier:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth/month

Monitor usage in respective dashboards to avoid hitting limits.

## Success Criteria

Your deployment is successful when:

✓ App loads at your Streamlit Cloud URL
✓ 3-column layout displays correctly
✓ You can send messages and get AI responses
✓ Environmental metrics update with each message
✓ Chat history shows in left column
✓ After reboot, all messages persist
✓ Metrics persist after reboot
✓ Settings persist after reboot
✓ No errors in Streamlit logs
✓ Data appears in Supabase tables

## Getting Help

- **Streamlit Docs**: https://docs.streamlit.io
- **Supabase Docs**: https://supabase.com/docs
- **Google AI Docs**: https://ai.google.dev/docs

## Congratulations! 🎉

Your Ecomate app is now live and persisting data!

Share your app URL with others to demonstrate AI environmental impact awareness.

