import { HubApiClient } from "@hubnegocios/api-client";

export const api = new HubApiClient({
  baseUrl: process.env.NEXT_PUBLIC_HUBNEGOCIOS_API_URL ?? "http://localhost:4000"
});
