# The Health Blueprint

## What This Is
An interactive public health education platform for teens. Each Blueprint topic has its own simulation lab with real data, interactive tools, and games. Built with Next.js, Tailwind CSS, Recharts, and Radix UI.

## Design Direction
The goal is a modern, clean, Apple-style aesthetic. Think apple.com — premium, minimal, confident, a lot of whitespace, smooth animations, everything feeling intentional. Not clinical, not childish, not generic. The kind of site where the design itself communicates that the content is credible.

Claude Code has complete creative freedom over colors, typography, spacing, card styles, animations, layout details, and visual design decisions. If something looks better a different way, do it that way.

## Lab Layout
Labs should feel like interactive experiences, not dashboards. The simulations are the main event. Controls should be intuitive and tactile. Data should respond instantly to input. Each lab should be organized into clear visual zones that give the page rhythm and hierarchy. Mobile should feel just as good as desktop.

## Writing Voice
Our readers are American teenagers, and they're smart. Write like a sharp older friend explaining something they actually find interesting, not a lab manual and not a corporate wellness app. Warm, direct, and a little bit cool. Premium and clean like the design, just human. This is the standing rule for all copy, not a one-time pass.

- Talk to the reader like a person. Use "you" and "your," never "the user" or "individuals."
- Keep every real science term (phosphagen, glycolytic, melatonin, cortisol, adenosine, amygdala, and so on) and keep every citation exact. Only the wrapper copy around the science gets the friendly treatment, never the facts, numbers, or sources.
- No clinical or textbook phrasing. If a sentence sounds like a study abstract, rewrite it.
- Do not reach for teen slang or try-hard internet phrasing. Respect the reader. Natural beats "relatable."
- Plain verbs: "start," "set," "use." Never "initiate," "configure," "utilize," or "parameters."
- Short sentences. Make the point, then move on. Read it out loud; if it sounds weird, rewrite it.
- Banned words: "crucial," "vital," "essential," "comprehensive," "it's important to note," "plays a critical role."
- No em dashes anywhere. Use a comma, a period, or rewrite the sentence.

Before and after:
- "Evening screens" becomes "Phone before bed" or "Late-night scrolling."
- "Bright morning light" becomes "Morning sunlight" or "Getting outside in the morning."
- "Configure your sleep parameters" becomes "Set your bedtime and wake-up."
- "This dip is a normal physiological occurrence" becomes "This dip is scheduled, not you slacking."

## Project Structure
- Homepage: app/page.tsx
- Sleep Lab: app/labs/sleep/page.tsx
- Energy Lab: app/labs/energy/page.tsx
- Stress Lab: app/labs/stress/page.tsx
- Games: app/labs/sleep/games/[game]/page.tsx
- Shared components: components/labs/

## Commands
- pnpm dev — start dev server
- pnpm build — production build

## Rules
- All health data must be evidence-based and accurate for teenagers
- Every simulation needs real citations (PubMed, NIH, CDC, peer-reviewed journals)
- Never use placeholder data — use real researched numbers
- No overlapping UI elements
- All SVG visualizations must scale properly on mobile
- Minimum 44px tap targets on mobile