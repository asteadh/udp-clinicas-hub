/**
 * Canonical Hub Negocios UDP design tokens. Single source of truth:
 * tokens.css (--hub-* vars) and each app's @theme inline block must stay in
 * parity with this file — enforced by scripts/validation/check-design-tokens.mjs.
 */
/* Paleta institucional UDP. El rojo y el gris salen de un análisis de píxeles
   del logo oficial (UDP_LogoRGB_2lineas_Color_SinFondo.png): #D2232A ocupa el
   69,4% de los píxeles opacos y #3F3E3E el 21,2%. Los neutros son papel y arena,
   no grises azulados.

   Los nombres `blue` / `deepBlue` / `sky` vienen del proyecto anterior (Gremia,
   que era azul) y hoy mienten sobre su contenido. Renombrarlos toca 14 archivos
   entre ambas apps, así que se deja como deuda cosmética para un PR aparte.

   Regla de marca: el rojo va como TRAZO — filete, subrayado, marca de sección,
   regla de cita — nunca como superficie grande ni relleno de botón. */
export const hubColors = {
  blue: "#D2232A",
  deepBlue: "#3F3E3E",
  blueSoft: "#F7E3E4",
  sky: "#A81B21",
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
  warm: "#F8F7F4",
  warmSurface: "#E7E4D9",
  surface: "#FFFFFF",
  border: "#D8D3C6",
  muted: "#6D6D6D",
  mutedSoft: "#9C978B",
  ink: "#1C1C1C"
} as const;

/* En oscuro el rojo institucional #D2232A solo alcanza 3,36:1 sobre el papel
   oscuro: sirve para trazo gráfico, no para texto chico. `blue` es aquí el rojo
   aclarado que sí pasa 4,5:1, porque el token se usa también como color de texto. */
export const hubColorsDark = {
  blue: "#F54842",
  deepBlue: "#111110",
  blueSoft: "#2E1A19",
  sky: "#F5776F",
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
  warm: "#1A1917",
  warmSurface: "#26241F",
  surface: "#222120",
  border: "#35332F",
  muted: "#A09B92",
  mutedSoft: "#75716A",
  ink: "#E4E1DA"
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

/* Sombras neutras sobre la tinta, no sobre el azul de Gremia. */
export const hubShadows = {
  card: "0 1px 3px rgba(28, 28, 28, 0.04), 0 4px 12px rgba(28, 28, 28, 0.04)",
  cta: "0 2px 6px rgba(210, 35, 42, 0.18)",
  hero: "0 12px 32px rgba(28, 28, 28, 0.08)",
  overlay: "0 18px 50px rgba(28, 28, 28, 0.12)"
} as const;

/* Tipografía. La UDP usa Garamond Premier Pro y Museo Sans vía kits de Adobe
   Fonts (`kpw3sod` en udp.cl, `tut3nix` en derecho.udp.cl). Mientras no se
   confirme si esa licencia cubre este dominio, se usan los equivalentes libres
   verificados en Google Fonts: EB Garamond y Hanken Grotesk. */
export const hubFontFamily =
  '"Hanken Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const hubHeadingFontFamily = '"EB Garamond", Georgia, "Times New Roman", serif';
