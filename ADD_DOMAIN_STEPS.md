# Add automabook.com Domain - Step by Step

## In Vercel Dashboard

1. **Go to your project**
   - Click on "automabook" project in Vercel dashboard

2. **Go to Settings**
   - Click "Settings" tab (top navigation)

3. **Click "Domains"**
   - In the left sidebar, click "Domains"

4. **Add Domain**
   - Click "Add" or "Add Domain" button
   - Enter: `automabook.com`
   - Click "Add"

5. **Add www subdomain (optional but recommended)**
   - Click "Add" again
   - Enter: `www.automabook.com`
   - Click "Add"

## Configure DNS at Your Domain Registrar

After adding domains, Vercel will show you DNS records to add.

### For automabook.com:
- **Type**: `A` record
- **Name**: `@` (or leave blank, depends on registrar)
- **Value**: The IP address Vercel shows (something like `76.76.21.21`)

### For www.automabook.com:
- **Type**: `CNAME` record
- **Name**: `www`
- **Value**: `cname.vercel-dns.com` (or what Vercel shows)

## Where to Add DNS Records

Go to where you bought the domain (Namecheap, GoDaddy, Google Domains, etc.):

1. Find **DNS Management** or **DNS Settings**
2. Add the records Vercel provided
3. Save changes

## Wait for DNS Propagation

- Usually takes 5-60 minutes
- Can take up to 24 hours (rare)
- Vercel will show "Valid Configuration" when ready

## SSL Certificate

Vercel automatically provides free SSL! Once DNS propagates, your site will be at:
- `https://automabook.com`
- `https://www.automabook.com`

