# Vercel DNS Records for automabook.com

## Standard Vercel DNS Records

If Vercel isn't showing you the records yet, here are the standard ones:

### For automabook.com (root domain):
**Option 1 - A Record:**
- Type: `A`
- Name: `@` (or leave blank, depends on registrar)
- Value: `76.76.21.21` (Vercel's IP address)

**Option 2 - CNAME Record (if A record doesn't work):**
- Type: `CNAME`
- Name: `@` (or leave blank)
- Value: `cname.vercel-dns.com`

### For www.automabook.com:
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

## Where to Add These Records

Go to your domain registrar's DNS management:

1. **Namecheap**: Domain List → Manage → Advanced DNS
2. **GoDaddy**: My Products → DNS → Manage DNS
3. **Google Domains**: DNS → Custom records
4. **Cloudflare**: DNS → Records → Add record
5. **Name.com**: DNS Records

## After Adding DNS Records

1. Wait 5-60 minutes for DNS to propagate
2. Go back to Vercel and try adding the domain again
3. Vercel should detect the DNS and allow you to add it

## Get Exact Records from Vercel

After you successfully add the domain in Vercel (once DNS is configured), Vercel will show you the exact records in:
- **Vercel Dashboard** → Your Project → **Settings** → **Domains** → Click on the domain

The records shown there are the official ones to use.

