import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Design-token parity gate. Source of truth: packages/ui/src/tokens.ts
 * (hubColors light + hubColorsDark). Checks:
 *  1. tokens.css defines every token, with the right hex, in both themes.
 *  2. App globals.css files contain no literal palette hexes and use
 *     `@theme inline` so dark mode resolves at use-site.
 *  3. App .tsx files never hardcode a palette hex (they bypass dark mode).
 */

const failures = [];
const read = (p) => readFileSync(p, "utf8");

const ts = read("packages/ui/src/tokens.ts");
const tokensCss = read("packages/ui/src/tokens.css");
const componentsCss = read("packages/ui/src/components.css");
const appGlobals = {
  "apps/web/src/app/globals.css": read("apps/web/src/app/globals.css"),
  "apps/admin/src/app/globals.css": read("apps/admin/src/app/globals.css")
};

// --- Parse tokens.ts ---------------------------------------------------
function parseTokenObject(source, objectName) {
  const match = source.match(new RegExp(`export const ${objectName} = \\{([\\s\\S]*?)\\} as const;`));
  if (!match) {
    failures.push(`tokens.ts: could not find ${objectName}`);
    return {};
  }
  const tokens = {};
  for (const [, key, hex] of match[1].matchAll(/(\w+):\s*"#([0-9a-fA-F]{6})"/g)) {
    tokens[key] = hex.toUpperCase();
  }
  return tokens;
}

const light = parseTokenObject(ts, "hubColors");
const dark = parseTokenObject(ts, "hubColorsDark");

const missingDark = Object.keys(light).filter((k) => !(k in dark));
if (missingDark.length) {
  failures.push(`tokens.ts: hubColorsDark is missing keys: ${missingDark.join(", ")}`);
}

// --- tokens.ts key -> CSS var name --------------------------------------
const cssVarNames = {
  blue: "--hub-blue",
  deepBlue: "--hub-deep-blue",
  blueSoft: "--hub-blue-soft",
  sky: "--hub-sky",
  gold: "--hub-gold",
  goldDeep: "--hub-gold-deep",
  honey: "--hub-honey",
  honeySoft: "--hub-honey-soft",
  coral: "--hub-coral",
  coralSoft: "--hub-coral-soft",
  coralText: "--hub-coral-text",
  mint: "--hub-mint",
  mintSoft: "--hub-mint-soft",
  mintText: "--hub-mint-text",
  warm: "--hub-warm",
  warmSurface: "--hub-warm-surface",
  surface: "--hub-surface",
  border: "--hub-border",
  muted: "--hub-muted",
  mutedSoft: "--hub-muted-soft",
  ink: "--hub-ink"
};

const unmappedKeys = Object.keys(light).filter((k) => !(k in cssVarNames));
if (unmappedKeys.length) {
  failures.push(`check-design-tokens.mjs: add CSS var mapping for new tokens: ${unmappedKeys.join(", ")}`);
}

// --- 1. tokens.css parity (light + dark blocks) -------------------------
const lightBlock = tokensCss.match(/:root,\s*\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/)?.[1];
const darkBlock = tokensCss.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/)?.[1];
if (!lightBlock || !darkBlock) {
  failures.push("tokens.css: missing light and/or dark theme block");
} else {
  for (const [key, varName] of Object.entries(cssVarNames)) {
    if (light[key] && !lightBlock.toUpperCase().includes(`${varName.toUpperCase()}: #${light[key]}`)) {
      failures.push(`tokens.css light: ${varName} should be #${light[key]}`);
    }
    if (dark[key] && !darkBlock.toUpperCase().includes(`${varName.toUpperCase()}: #${dark[key]}`)) {
      failures.push(`tokens.css dark: ${varName} should be #${dark[key]}`);
    }
  }
}

// --- 1b. Clinic accent tokens (hubClinicColors -> --hub-clinic-*) --------
function parseFlatHexObject(source, objectName) {
  const match = source.match(new RegExp(`export const ${objectName} = \\{([\\s\\S]*?)\\} as const;`));
  if (!match) {
    failures.push(`tokens.ts: could not find ${objectName}`);
    return {};
  }
  const tokens = {};
  for (const [, key, hex] of match[1].matchAll(/["']?([\w-]+)["']?:\s*"#([0-9a-fA-F]{6})"/g)) {
    tokens[key] = hex.toUpperCase();
  }
  return tokens;
}

const clinicColors = parseFlatHexObject(ts, "hubClinicColors");
for (const [slug, hex] of Object.entries(clinicColors)) {
  const varName = `--hub-clinic-${slug}`;
  if (!tokensCss.toUpperCase().includes(`${varName.toUpperCase()}: #${hex}`)) {
    failures.push(`tokens.css: ${varName} should be #${hex}`);
  }
}

// --- 2. App globals: no literal hexes, @theme inline present -------------
for (const [path, css] of Object.entries(appGlobals)) {
  if (!css.includes("@theme inline")) {
    failures.push(`${path}: palette must be mapped via "@theme inline" (plain @theme bakes light hexes at build time)`);
  }
  const withoutShadows = css.replace(/--shadow-[^;]+;/g, "");
  const hexes = [...withoutShadows.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  if (hexes.length) {
    failures.push(`${path}: literal colors found (use var(--hub-*) instead): ${[...new Set(hexes)].join(", ")}`);
  }
}

// components.css must also stay literal-free.
const componentHexes = [...componentsCss.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
if (componentHexes.length) {
  failures.push(`packages/ui/src/components.css: literal colors found: ${[...new Set(componentHexes)].join(", ")}`);
}

// --- 3. App .tsx files: no hardcoded palette hexes ------------------------
// Exempt files that legitimately hold literals: error boundaries that render
// outside globals.css and the admin forbidden screen.
const tsxExemptPatterns = [
  /global-error\.tsx$/,
  /(^|\/)error\.tsx$/,
  /not-found\.tsx$/,
  /forbidden\//
];
const paletteHexes = new Set(
  [...Object.values(light), ...Object.values(dark)].map((hex) => `#${hex}`.toUpperCase())
);

function walkTsx(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkTsx(path));
    else if (entry.name.endsWith(".tsx")) files.push(path);
  }
  return files;
}

for (const root of ["apps/web/src", "apps/admin/src"]) {
  for (const path of walkTsx(root)) {
    const normalized = path.replaceAll("\\", "/");
    if (tsxExemptPatterns.some((pattern) => pattern.test(normalized))) continue;
    const source = read(path);
    const found = [...source.matchAll(/#[0-9a-fA-F]{6}\b/g)]
      .map((m) => m[0].toUpperCase())
      .filter((hex) => paletteHexes.has(hex));
    if (found.length) {
      failures.push(`${normalized}: hardcoded palette colors (use var(--hub-*) / Tailwind token utilities): ${[...new Set(found)].join(", ")}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Hub Negocios design tokens aligned (${Object.keys(light).length} tokens, light + dark).`);
