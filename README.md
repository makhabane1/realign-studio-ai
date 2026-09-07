# Realign

An AI-powered content studio for real estate agents. Realign turns one property input into on-brand listing descriptions, social captions, follow-up emails, branded listing graphics, neighborhood highlights, and monthly market newsletters.

**Live app**: https://realign-studio-ai.lovable.app

## What it does

Real estate agents spend hours writing repetitive content for every listing while trying to keep their personal brand voice consistent. Realign learns that voice once, then generates everything an agent needs from a single property form.

## Core features

### Agent Brand Voice Setup
- Name, brokerage, tone attributes (e.g. luxury, friendly, direct), target buyer type
- Visual style preference: Minimal, Bold, Luxury, or Warm
- Two brand colors that feed into generated graphics
- One Voice Profile per agent account

### New Listing Generator
- Input: property type, bedrooms, bathrooms, price, neighborhood, target buyer, key features
- Generates in the agent's voice:
  - MLS-ready listing description
  - Instagram/Facebook caption with hashtags
  - Follow-up email template for interested leads
  - Branded square listing graphic
- Loading skeletons while content generates

### Neighborhood Highlights
- Generate 3–5 locally-relevant talking points from the neighborhood name and property context
- Covers schools, parks, dining/shopping, walkability, and area character
- Preview and append a natural-language paragraph directly into the listing description
- Free-tier accessible

### Listings Library
- Dashboard of all past listings with generated content and images
- Filter by status: Active, Sold, Draft
- Copy and export each content piece

### Market Update Newsletter
- Input monthly stats: median price, days on market, inventory, area, period, agent notes
- AI writes a 220–320 word client-friendly newsletter in the agent's brand voice
- Saved history with copy/export support

## Plan & premium gating

- **Free**: 5 listings/month + 3 branded images/month
- **Pro**: Unlimited listings and images ($29/mo)
- Neighborhood highlights and market newsletters are included on both tiers

## Tech stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [Lovable Cloud](https://lovable.dev) — backend, auth, and database
- Google and email/password authentication
- AI generation via Lovable AI Gateway (Gemini models)

## Project structure

- `src/routes/` — TanStack file-based routes
- `src/lib/ai.server.ts` — AI prompts and generation helpers
- `src/lib/realign.functions.ts` — listing, image, and highlight server functions
- `src/lib/market.functions.ts` — market newsletter server functions
- `src/components/realign/` — shared UI components like `CopyBlock`

## Getting started locally

```sh
npm i
npm run dev
```

The dev server runs at `http://localhost:8080`.

---

This project was built with [Lovable](https://lovable.dev).
