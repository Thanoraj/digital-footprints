# Deployment Guide

Complete guide for deploying Ecomate to production.

## Prerequisites

- [ ] Node.js 18+ installed locally
- [ ] Supabase account and project
- [ ] Google AI API key
- [ ] GitHub repository (for Vercel deployment)
- [ ] Domain name (optional)

## Deployment Platforms

### Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### Steps

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Import in Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Configure project

3. **Add Environment Variables**

In Vercel dashboard → Settings → Environment Variables:

```env
GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Deploy**

Click "Deploy" - Vercel will automatically build and deploy.

#### Custom Domain

1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

### Netlify

Alternative platform for Next.js.

#### Steps

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select repository

2. **Build Settings**

```
Build command: npm run build
Publish directory: .next
```

3. **Environment Variables**

Add in Site settings → Environment variables (same as Vercel)

4. **Deploy**

Click "Deploy site"

### Self-Hosted (VPS/Cloud)

For custom infrastructure.

#### Requirements

- Ubuntu 22.04+ (or similar)
- Node.js 18+
- PM2 or similar process manager
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt)

#### Steps

1. **Set Up Server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

2. **Clone and Build**

```bash
# Clone repository
git clone <your-repo-url>
cd digital-footprints

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
GOOGLE_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
EOF

# Build
npm run build
```

3. **Start with PM2**

```bash
pm2 start npm --name "digital-footprints" -- start
pm2 save
pm2 startup
```

4. **Configure Nginx**

```nginx
# /etc/nginx/sites-available/digital-footprints
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/digital-footprints /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. **SSL Certificate**

```bash
sudo certbot --nginx -d your-domain.com
```

## Database Setup

### Supabase Configuration

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your Project URL and anon key

2. **Run Schema Migration**

- Go to SQL Editor in Supabase dashboard
- Copy contents of `supabase/schema.sql`
- Execute

3. **Verify Tables**

Check that tables exist:
- `chat_sessions`
- `messages`

4. **Configure RLS Policies**

Already included in schema - verify in Authentication → Policies

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Gemini AI API key | `AIza...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJh...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |

## PWA Configuration

### Service Worker

The PWA service worker is automatically generated during build.

Verify in production:
- Open DevTools → Application → Service Workers
- Should see registered worker

### Install Prompt

Users can install the app:
- Desktop: Chrome/Edge - Install icon in address bar
- Mobile: "Add to Home Screen" in browser menu

### Offline Support

The app caches static assets but requires internet for:
- API calls
- Supabase database
- Gemini AI responses

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle
npm run build

# Check bundle size in output
```

### Caching Headers

Already configured in `next.config.ts`:
- Static assets: Long cache
- API routes: No cache
- Pages: Revalidate on demand

### CDN

Vercel includes global CDN automatically. For self-hosted:
- Use Cloudflare
- Configure caching rules

## Monitoring

### Error Tracking

Consider adding:
- Sentry
- LogRocket
- Datadog

### Analytics

Add to `app/layout.tsx`:
- Google Analytics
- Plausible
- Umami

### Performance Monitoring

- Vercel Analytics (built-in)
- Web Vitals tracking
- Lighthouse CI

## Security

### Environment Variables

 **NEVER commit `.env.local` to git**

- Keep secrets in platform environment variables
- Use different keys for dev/prod

### API Rate Limiting

Consider implementing:
- Rate limiting on API routes
- Request throttling
- IP-based limits

### CORS

Already configured in API routes. For custom domains, update headers in `next.config.ts`.

## Backup Strategy

### Database

Supabase includes:
- Automatic daily backups (Pro plan)
- Point-in-time recovery

Manual backup:
```bash
# Export data
pg_dump DATABASE_URL > backup.sql
```

### Code

- Push to GitHub regularly
- Tag releases: `git tag v1.0.0`
- Use GitHub Releases for changelogs

## Troubleshooting

### Build Fails

1. Check Node.js version: `node --version` (must be 18+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check build logs for specific errors

### Runtime Errors

1. Verify environment variables are set
2. Check Supabase connection
3. Verify Google AI API key is valid
4. Check browser console for client errors

### Database Errors

1. Verify RLS policies allow operations
2. Check table structure matches schema
3. Verify network connectivity to Supabase

### PWA Not Installing

1. Must be served over HTTPS
2. Manifest must be valid
3. Service worker must register
4. Check DevTools → Application → Manifest

## Rollback

### Vercel

1. Go to Deployments
2. Find previous deployment
3. Click "..." → "Promote to Production"

### Self-Hosted

```bash
# Git rollback
git log  # Find commit hash
git checkout <commit-hash>
npm run build
pm2 restart digital-footprints
```

## Scaling

### Database

Supabase scales automatically. For high load:
- Upgrade to Pro plan
- Enable connection pooling
- Add read replicas

### Application

Vercel scales automatically. For self-hosted:
- Add more server instances
- Use load balancer (Nginx, HAProxy)
- Enable caching (Redis)

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Can create new session
- [ ] Can send messages and receive responses
- [ ] Metrics display correctly
- [ ] Settings can be changed
- [ ] PWA can be installed
- [ ] Mobile responsive
- [ ] SSL certificate valid
- [ ] Environment variables set
- [ ] Database connection working
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] DNS configured (if custom domain)

## Support

For deployment issues:
- Check [README.md](README.md) for setup
- Review [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for migrations
- Open GitHub issue

---

**Production URL**: https://your-domain.com

Last updated: 2025-01-12


