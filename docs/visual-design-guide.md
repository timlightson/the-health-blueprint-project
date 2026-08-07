# THBP Visual Design Guide

This guide defines the visual rules for The Health Blueprint Project. It is intentionally narrow: preserve the existing cream canvas, navy typography, glass surfaces, and youthful tone while making every illustration feel deliberate and specific to the science it explains.

## Visual principles

1. **Explain before decorating.** Every prominent visual needs a clear subject: a signal, mechanism, input, state, or outcome. Remove marks that do not help a user understand or identify the experience.
2. **Illustrate the experience, not the category.** A droplet alone does not explain hydration. Show a changing reservoir, fluid level, or concentration. A target alone does not explain focus. Show attention holding while distractions compete for it.
3. **Use a shared frame, not repeated artwork.** Blueprint cards share grids, edge markers, lighting, labels, and depth. Their central scenes must remain distinct.
4. **Keep the interface warm.** Cream backgrounds and navy text carry the product. Dark illustrated stages are contained moments of contrast, not the default page surface.
5. **Stay legible at card size.** One dominant silhouette, one supporting mechanism, and no more than two small labels should communicate the idea before the user reads the card title.

## Blueprint artwork

Each Blueprint cover uses the same scene anatomy:

- a dark, topic-tinted field;
- a subtle 24 px drafting grid;
- one dominant illustrated mechanism;
- quiet corner registration marks;
- a short mechanism label at top left;
- a restrained `LIVE MODEL` label at top right;
- one or two motions tied to how the mechanism works.

Topic colors identify a Blueprint but should not flood the whole page. Use the accent at full strength for the subject, data state, or interaction response. Use lower-opacity versions for atmosphere and supporting marks.

Avoid emoji, isolated Lucide icons used as artwork, generic people, decorative charts, and compositions made from unrelated floating shapes.

## Illustration rules

- Prefer hand-authored SVG for interface artwork and explanatory scenes.
- Build depth with three layers: atmosphere, subject, and foreground detail.
- Use rounded geometry where the subject is bodily or rhythmic; use firmer geometry for devices, controls, and measurements.
- Keep strokes between 1.5 and 3 px in a `360 × 220` card viewBox.
- Use text inside artwork only for short functional labels. Never place paragraph copy inside an SVG.
- Human figures should depict a concrete action or state. Do not use standing mannequin silhouettes as generic health decoration.

## Motion principles

Motion should reveal behavior:

- rotation for cycles and elapsed time;
- traveling dashes for airflow or signal direction;
- rising bubbles for fluid movement;
- restrained scaling for pressure, breathing, or focus;
- equalizer movement for sound;
- short hover lift and saturation changes to indicate that a card opens.

Default loops should be slow and quiet. Hover may increase emphasis, not introduce an unrelated effect. Avoid bounce, confetti, constant large translations, and multiple competing animation speeds.

Every animated system must stop under `prefers-reduced-motion`. The static frame must still communicate the concept without relying on movement.

## Icons and controls

- Use Lucide icons for navigation, buttons, and compact controls—not as hero artwork.
- Keep a consistent 1.5–2 px icon stroke.
- Icon-only controls require an accessible name and a visible focus state.
- Active controls may use topic color, glow, or fill. Inactive controls should remain visible without competing with the content.

## Color and contrast

- Page canvas: warm cream or the existing pale blueprint field.
- Primary text: deep navy.
- Supporting text: existing `--ink-soft` and `--ink-faint` tokens.
- Illustrated stages: deep navy plus one topic tint.
- Teal communicates healthy/restored states; amber communicates caution; red communicates accumulated strain or risk.
- Do not use semantic colors only decoratively inside data displays.

All essential labels, controls, and outcomes must remain readable without glow, transparency, or color alone.

## What to avoid

- generic school-project diagrams;
- a chart placed in empty space without visual storytelling;
- stock-style doctors, mascots, or mannequin avatars;
- AI-like compositions with arbitrary sparkles or floating blobs;
- mixing flat pastel cards with highly dimensional cards in the same set;
- animation that continues only because the component is on screen;
- visual polish that makes a health claim appear more certain than its evidence.

## Interaction and accessibility

- Every drag control needs a keyboard-operable equivalent, normally a native range input or a correctly labeled slider.
- Keep touch targets at least 24 px square; aim for 44 px where the layout permits.
- Provide a skip-to-content link and one clear level-one heading on every route.
- Do not rely on color alone to identify a target, state, warning, or result.
- Dynamic results should have concise accessible names. Avoid live announcements for continuously changing visual effects.
- A reduced-motion view is a first-class state, not a fallback.

## Evidence language

- Call custom calculations a model, estimate, score, or illustration. Do not present them as personal risk assessments.
- State the study population, dose, or experimental condition when it materially limits a finding.
- Prefer “was associated with” or “a controlled study found” over an unsupported causal claim.
- Do not turn one study result into a universal threshold or percentage.
- Keep safety notes and model limitations close to the relevant interaction.
