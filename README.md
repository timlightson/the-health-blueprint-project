# The Health Blueprint

An interactive public health education platform for teens. Each Blueprint topic has its own simulation lab with real, cited data, interactive tools, and games. Move the controls and watch real data react in real time.

Built with Next.js, Tailwind CSS, Recharts, and Radix UI.

## Labs

- **Sleep** — build your real week and watch sleep debt stack up: reaction time, memory, and mood.
- **Energy** — build your real day and meet the 24-hour clock behind your afternoon slump.
- **Stress** — stack up a day's worth of pressure and watch it take focus, memory, and patience offline.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm start` — serve the production build

## Project structure

- `app/page.tsx` — homepage
- `app/labs/{sleep,energy,stress}/page.tsx` — the simulation labs
- `app/labs/sleep/games/[game]/page.tsx` — sleep mini-games
- `components/labs/` — shared lab components
- `app/globals.css` — design tokens and the Liquid Glass system

## Notes

- All health data is evidence-based and cited (CDC, NIH, peer-reviewed research).
- For educational purposes only. Not medical advice.

## Configuration

Set `NEXT_PUBLIC_SITE_URL` to your deployed origin so social/share metadata and
the Open Graph image resolve to absolute URLs. Defaults to `https://healthblueprint.app`.
