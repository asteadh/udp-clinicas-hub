import { readFileSync } from "node:fs";

const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
if (!home.includes("api.clinics") || !home.includes("ClinicCard")) {
  throw new Error("web home smoke failed");
}

const header = readFileSync(new URL("../src/components/site-header.tsx", import.meta.url), "utf8");
if (!header.includes("HubLogo") || !header.includes("hub-nav")) {
  throw new Error("web header smoke failed");
}

const contactForm = readFileSync(new URL("../src/components/contact-form.tsx", import.meta.url), "utf8");
if (!contactForm.includes("api.contact") || !contactForm.includes("use client")) {
  throw new Error("web contact form smoke failed");
}

const clinicPage = readFileSync(new URL("../src/app/clinicas/[slug]/page.tsx", import.meta.url), "utf8");
if (!clinicPage.includes("notFound") || !clinicPage.includes("clinicGallery")) {
  throw new Error("web clinic detail smoke failed");
}

const articlePage = readFileSync(new URL("../src/app/articulos/[slug]/page.tsx", import.meta.url), "utf8");
if (!articlePage.includes("notFound") || !articlePage.includes("bodyHtml")) {
  throw new Error("web article detail smoke failed");
}

console.log("web smoke ok");
