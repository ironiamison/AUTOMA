# Deploy Automa to Vercel

## Quick Deploy (5 minutes)

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if you don't have it):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (choose your account)
   - Link to existing project? **No**
   - Project name? **automa** (or your choice)
   - Directory? **./** (current directory)
   - Override settings? **No**

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect settings
   - Click "Deploy"

## Important Notes

### Database (SQLite)
- SQLite works on Vercel but is **ephemeral** (resets on each deployment)
- For production, consider:
  - **Vercel Postgres** (recommended)
  - **Supabase** (free tier available)
  - **PlanetScale** (MySQL, free tier)

### Environment Variables
If you add any API keys or secrets later, add them in:
- Vercel Dashboard → Project → Settings → Environment Variables

### Custom Domain
After deployment:
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain

## After Deployment

Your site will be live at:
- `https://your-project-name.vercel.app`

Share this URL with people to test!

## Troubleshooting

**Database not working?**
- SQLite files reset on Vercel deployments
- Consider switching to Vercel Postgres for persistent storage

**API routes not working?**
- Make sure `vercel.json` is in the root
- Check Vercel function logs in dashboard

**Static files not loading?**
- Make sure files are in the repo
- Check file paths (use relative paths like `./logo2.png`)

