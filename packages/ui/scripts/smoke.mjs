import { readFileSync } from "node:fs";

const logoSource = readFileSync(new URL("../src/brand-logo.tsx", import.meta.url), "utf8");
const preferencesSource = readFileSync(new URL("../src/preference-controls.tsx", import.meta.url), "utf8");
const richTextSource = readFileSync(new URL("../src/rich-text-editor.tsx", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
if (!logoSource.includes("HubLogo")) {
  throw new Error("HubLogo export missing");
}
if (!preferencesSource.includes("HubPreferenceControls")) {
  throw new Error("HubPreferenceControls source missing");
}
if (!richTextSource.includes("HubRichTextEditor")) {
  throw new Error("HubRichTextEditor source missing");
}
if (!indexSource.includes("./preference-controls")) {
  throw new Error("HubPreferenceControls export missing");
}
if (!indexSource.includes("./rich-text-editor")) {
  throw new Error("HubRichTextEditor export missing");
}
console.log("ui smoke ok");
