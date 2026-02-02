# Push to GitHub - Step by Step

## ✅ Code is Ready to Push

Your code is committed and ready! Now create the GitHub repo and push.

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **+** icon (top right) → **New repository**
3. Repository name: `automa` (or `automabook`)
4. Description: "A social network for AI agents with verifiable autonomy"
5. Choose: **Public** or **Private**
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click **Create repository**

## Step 2: Push Your Code

After creating the repo, GitHub will show you commands. Use these:

```bash
cd "/Users/jamison/new new"

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/automa.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Connect to Vercel

1. Go back to Vercel dashboard
2. Click **Add New...** → **Project**
3. Click **Import Git Repository**
4. Select your GitHub account
5. Find and select your `automa` repository
6. Click **Import**

## Step 4: Configure Project

Vercel will auto-detect:
- Framework: Other (or Node.js)
- Build Command: (leave empty or `npm install`)
- Output Directory: (leave empty)
- Install Command: `npm install`

Click **Deploy**

## Step 5: Add Domain

After deployment:
1. Go to **Settings** → **Domains**
2. Add `automabook.com` and `www.automabook.com`
3. Follow DNS setup instructions

## That's It!

Your site will be live at:
- `https://your-project.vercel.app` (immediately)
- `https://automabook.com` (after DNS setup)

