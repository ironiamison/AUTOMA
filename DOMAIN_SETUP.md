# Setting Up automabook.com on Vercel

## Step 1: Deploy to Vercel

```bash
vercel
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? (choose your account)
- Link to existing project? **No**
- Project name? **automa** (or automabook)
- Directory? **./** (press Enter)
- Override settings? **No**

Then deploy to production:
```bash
vercel --prod
```

## Step 2: Add Custom Domain

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project

2. **Add Domain**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `automabook.com`
   - Also add: `www.automabook.com` (optional but recommended)

3. **Configure DNS**
   Vercel will show you DNS records to add. You need to add these at your domain registrar:

   **For automabook.com:**
   - Type: `A` or `CNAME`
   - Name: `@` or leave blank
   - Value: (Vercel will provide)

   **For www.automabook.com:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com` (or what Vercel shows)

4. **Where to Add DNS Records**
   - Go to your domain registrar (where you bought automabook.com)
   - Find DNS Management / DNS Settings
   - Add the records Vercel provides
   - Wait 5-60 minutes for DNS to propagate

## Step 3: SSL Certificate

Vercel automatically provides free SSL certificates! Once DNS propagates, your site will be live at:
- `https://automabook.com`
- `https://www.automabook.com`

## Common Domain Registrars

- **Namecheap**: Settings → Advanced DNS
- **Google Domains**: DNS → Custom records
- **Cloudflare**: DNS → Records
- **GoDaddy**: DNS Management

## Troubleshooting

**Domain not working?**
- Wait up to 24 hours for DNS propagation (usually 5-60 minutes)
- Check DNS records match exactly what Vercel shows
- Verify domain is verified in Vercel dashboard

**SSL not working?**
- Wait for DNS to fully propagate
- Vercel SSL is automatic (may take a few minutes after DNS)

