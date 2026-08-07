# The Health Blueprint

**Health lessons school never taught you.**

An interactive health education project for teens. The site has two layers: **Learn** (short articles with linked, contextualized sources) and **Explore** (nine interactive Blueprints built from simplified educational models).

Built with Next.js, Tailwind CSS, and Radix UI, on a custom Liquid Glass design system.

## The Blueprints

| # | Blueprint | What you do |
|---|-----------|-------------|
| 01 | Sleep | Build your real week and watch sleep debt hit reaction time, memory, and mood. Eight playable brain games. |
| 02 | Energy | Build your day, meet the 24-hour clock behind the afternoon slump, and see which engine fires in 16 sports. |
| 03 | Stress | The Pressure Chamber: stack up load, then breathe it back down. |
| 04 | Hydration | The Water Line: compare how activity and heat change an illustrative fluid-loss model. |
| 05 | Sound | Pitch Match by ear, plus how fast loud volume spends your daily hearing budget. |
| 06 | Focus | A distraction reaction game and the real cost of task switching. |
| 07 | Breath | Paced breathing that drives your nervous system in real time. |
| 08 | Caffeine | Drop drinks on a timeline and see what's still in you at bedtime. |
| 09 | Vision | Trade screen time for sunlight and watch your eyes' risk shift. |

## Key routes

- `/` — platform homepage and Blueprint catalog
- `/learn`, `/learn/[slug]` — cited articles that hand off to a Blueprint
- `/labs/{id}` — the nine Blueprints
- `/labs/sleep/games/[game]` — sleep mini-games
- `/about` — mission, the Learn/Explore structure, and the evidence rules
- `/project` — self-contained landing page for QR codes on resumes, applications, and posters
- `/links` — mobile-first link-in-bio page (the Instagram bio URL, replaces Linktree)

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build (type errors fail the build)
- `pnpm start` — serve the production build
- `pnpm lint` — run eslint

## Project structure

- `app/` — routes; each lab is one `app/labs/{id}/page.tsx`
- `components/labs/` — shared lab systems: `kit.tsx` primitives, `LabChrome.tsx` header/footer, `labs-meta.tsx` (single source of truth for lab identity), `LiquidGlass.tsx`
- `components/site/` — platform nav, footer, and brand mark
- `lib/articles.ts` — the Learn articles
- `lib/sports-energy.ts` — cited energy-system data for 16 sports
- `app/globals.css` — design tokens and the Liquid Glass system
- `docs/brand-and-social.md` — brand positioning and Instagram templates

## Notes

- Central health claims should link to primary research, reviews, or authoritative guidance. Model outputs are educational estimates, not personal measurements or medical advice.
- For educational purposes only. Not medical advice.

## Configuration

Set `NEXT_PUBLIC_SITE_URL` to your deployed origin so social metadata, the sitemap, and the Open Graph image resolve to absolute URLs. Defaults to `https://thehealthblueprintproject.com`.
