/**
 * Canonical Hub Negocios UDP design tokens. Single source of truth:
 * tokens.css (--hub-* vars) and each app's @theme inline block must stay in
 * parity with this file — enforced by scripts/validation/check-design-tokens.mjs.
 */
export const hubColors = {
  blue: "#0B3D62",
  deepBlue: "#082A44",
  blueSoft: "#E4ECF5",
  sky: "#4A7FB5",
  gold: "#B08D33",
  goldDeep: "#7A5F1F",
  honey: "#E4CE8E",
  honeySoft: "#F5EEDA",
  coral: "#C0392B",
  coralSoft: "#FBE7E4",
  coralText: "#7A241B",
  mint: "#1F8A5F",
  mintSoft: "#E3F4EC",
  mintText: "#175E42",
  warm: "#F7F5F0",
  warmSurface: "#F1ECE1",
  surface: "#FFFFFF",
  border: "#D8D2C4",
  muted: "#5B6570",
  mutedSoft: "#9AA2AB",
  ink: "#1C2733"
} as const;

export const hubColorsDark = {
  blue: "#4A7FB5",
  deepBlue: "#0E2A3D",
  blueSoft: "#132D42",
  sky: "#7FA9D2",
  gold: "#D4B45F",
  goldDeep: "#F0D48A",
  honey: "#4A3D1D",
  honeySoft: "#332A11",
  coral: "#E07264",
  coralSoft: "#3A1D18",
  coralText: "#F2ADA3",
  mint: "#4FBE8D",
  mintSoft: "#123227",
  mintText: "#8FE0BE",
  warm: "#12161B",
  warmSurface: "#1E242C",
  surface: "#1A1F26",
  border: "#333B45",
  muted: "#A0A8B1",
  mutedSoft: "#5E666F",
  ink: "#EDEFF2"
} as const;

/** Per-clinic accent colors — seed values; editable at runtime via clinics.color_primary. */
export const hubClinicColors = {
  insolvencia: "#0F766E",
  "innovacion-emprendimiento": "#D97706",
  laboral: "#1D4ED8",
  tributario: "#6B1F3B"
} as const;

export const hubSpacing = {
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  xxl: "3rem"
} as const;

export const hubRadius = "8px" as const;

export const hubShadows = {
  card: "0 1px 3px rgba(28, 39, 51, 0.04), 0 4px 12px rgba(28, 39, 51, 0.04)",
  cta: "0 2px 6px rgba(11, 61, 98, 0.18)",
  hero: "0 12px 32px rgba(28, 39, 51, 0.08)",
  overlay: "0 18px 50px rgba(28, 39, 51, 0.12)"
} as const;

export const hubFontFamily =
  '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const hubHeadingFontFamily = '"Source Serif 4", Georgia, "Times New Roman", serif';
