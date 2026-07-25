import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/client.ts", import.meta.url), "utf8");
if (!source.includes("HubApiClient")) {
  throw new Error("HubApiClient export missing");
}
for (const method of [
  "login",
  "oauthGoogle",
  "identities",
  "passkeyRegisterBegin",
  "passkeyLoginBegin",
  "clinics",
  "clinicFaqs",
  "articles",
  "clinicGallery",
  "clinicTeam",
  "publicSettings",
  "contact",
  "uploadFile",
  "signedStorageUrl",
]) {
  if (!source.includes(`async ${method}`)) {
    throw new Error(`${method} method missing`);
  }
}
if (!source.includes("admin(token")) {
  throw new Error("admin() sub-client missing");
}
for (const adminMethod of [
  "adminUsers",
  "clinics",
  "faqs",
  "articles",
  "albums",
  "team",
  "contactInquiries",
  "settings",
  "summary",
  "audit",
]) {
  if (!source.includes(`${adminMethod}:`)) {
    throw new Error(`admin.${adminMethod} method missing`);
  }
}
console.log("api-client smoke ok");
