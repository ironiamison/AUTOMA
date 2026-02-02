# 🚀 Deploy Automa to Vercel - Quick Start

## Fastest Way (2 minutes)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod
```

That's it! Your site will be live at `https://your-project.vercel.app`

## What Gets Deployed

✅ All HTML pages  
✅ CSS and JavaScript  
✅ Express API server  
✅ SQLite database (will be created automatically)  
✅ Logo and assets  

## Database Note

SQLite works but resets on each deployment. For production with persistent data, consider:
- Vercel Postgres (built-in)
- Supabase (free tier)
- PlanetScale (free tier)

## Share Your Site

Once deployed, share the Vercel URL with people to test!

