# Listing Genius

Good choice — here's the updated prompt with the name swapped in:

Prompt for Lovable:

Build a web app called "Realign" — an AI-powered content studio for real estate agents that generates on-brand listing descriptions, social captions, matching images, and follow-up emails from a single property input.

Problem it solves: Real estate agents spend hours writing repetitive content for every new listing — descriptions, social posts, lead follow-ups — while trying to keep their personal brand voice consistent. Realign lets an agent input listing details once and generates all the content they need in their established voice.

Design direction:

Modern, premium real estate SaaS aesthetic — clean, trustworthy, professional (think Compass or Zillow Premier Agent, not generic AI purple gradients)

Light mode primary, with warm neutral accent color (deep navy or terracotta)

Property-card-style layout for listings dashboard

Sidebar navigation, clean sans-serif typography

Core features:

Agent Brand Voice Setup (onboarding)

Agent name, brokerage, tone attributes (e.g. luxury, friendly, direct), target buyer type

Visual style preference (Minimal, Bold, Luxury, Warm) + 2 brand colors

Save as a single Voice Profile per agent account

New Listing Generator

Input form: property type, bedrooms/bathrooms, key features (freeform text), price, neighborhood, target buyer

Generates: full listing description, a short social caption (Instagram/Facebook), and a follow-up email template for interested leads — all in the agent's voice

"Generate listing image" button — produces a styled social graphic for the listing using the property details + agent's visual style (call image API via Supabase Edge Function, not frontend)

Loading skeleton while generating, not a spinner

Listings Library

Dashboard of all past listings with their generated content and image

Search/filter by status (Active, Sold, Draft)

Copy/export/download options for each content piece

Data model (Supabase):

agents (id, name, brokerage, tone_tags, buyer_type, visual_style, brand_colors)

listings (id, agent_id, property_details jsonb, description, social_caption, follow_up_email, image_url, status, created_at)

Auth: Email/password + Google sign-in

Premium gating: Free tier = 5 listings/month with 3 images; Pro tier = unlimited listings and images ($29/mo)

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://realign-studio-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/abc3af12-23ec-49a5-bdd6-e6a06f840d84).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
