# DirectKey — Deployment Guide

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Edit .env.local — add your WhatsApp number
# NEXT_PUBLIC_WHATSAPP_NUMBER=905376724979

# 4. Run development server
npm run dev

# 5. Open in browser
# http://localhost:3000  → redirects to /en automatically
```

## 🌍 Language URLs

| Language | URL |
|----------|-----|
| English  | `/en` |
| Turkish  | `/tr` |
| Farsi    | `/fa` |
| Arabic   | `/ar` |

## 📦 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial DirectKey MVP"
git remote add origin https://github.com/YOUR_USERNAME/directkey.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Set Environment Variables in Vercel Dashboard:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` = `905XXXXXXXXX`
4. Click **Deploy**

### Step 3: Custom Domain (optional)
- In Vercel Dashboard → Domains → Add `directkey.com`
- Update DNS records as instructed

## 📋 Leads Storage

### MVP (Local / Development)
Leads are saved to `leads.json` in the project root.
View leads at: `GET /api/leads`

### Production Upgrade → Vercel Postgres
```bash
npm install @vercel/postgres
```
Then update `lib/leads.ts` to use SQL:
```typescript
import { sql } from '@vercel/postgres';

export async function saveLead(lead) {
  await sql`
    INSERT INTO leads (id, name, phone, budget, project, locale, timestamp, source)
    VALUES (${lead.id}, ${lead.name}, ${lead.phone}, ${lead.budget}, 
            ${lead.project}, ${lead.locale}, ${lead.timestamp}, ${lead.source})
  `;
}
```

## ⚡ Performance Tips
- Images are served from Unsplash CDN (swap with your own in production)
- Enable Vercel Edge Network for global fast loading
- Add `next/image` domain for your image host in `next.config.js`

## 📱 WhatsApp Number Configuration
Search for `905XXXXXXXXX` in the codebase and replace with your number:
- `components/Header.tsx`
- `components/Hero.tsx`
- `components/LeadForm.tsx`
- `components/WhatsAppButton.tsx`
- `components/Footer.tsx`

Or better: set `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local` and use:
```typescript
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!;
```

## 🔮 Phase 2 Roadmap
- [ ] Admin dashboard with lead CRM
- [ ] Email notifications on new leads
- [ ] AI chat agent for property recommendations