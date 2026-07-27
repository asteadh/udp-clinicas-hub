import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
if (!page.includes("AdminConsole")) {
  throw new Error("admin console smoke failed");
}
const header = readFileSync(new URL("../src/components/admin-header.tsx", import.meta.url), "utf8");
const preferences = readFileSync(new URL("../src/lib/preferences.tsx", import.meta.url), "utf8");
if (!header.includes("HubPreferenceControls") || !preferences.includes("hub-theme")) {
  throw new Error("admin preference smoke failed");
}
console.log("admin smoke ok");
