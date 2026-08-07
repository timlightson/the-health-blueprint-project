// ─── One source of truth for brand identity ──────────────────────────────────
// Every surface (site chrome, lab chrome, /links, /project, metadata) reads
// from here so the brand can never drift between pages.

export const SITE_NAME = "The Health Blueprint";
export const TAGLINE = "Health lessons school never taught you.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://healthblueprint.app";
export const SITE_DOMAIN_LABEL = "thehealthblueprintproject.com";

export const INSTAGRAM_HANDLE = "@thehealthblueprintproject";
export const INSTAGRAM_URL = "https://www.instagram.com/thehealthblueprintproject";
export const GITHUB_URL = "https://github.com/timlightson/the-health-blueprint-project";

export const DISCLAIMER = "For educational purposes only · not medical advice";
