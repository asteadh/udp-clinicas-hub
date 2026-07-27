/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@hubnegocios/api-client", "@hubnegocios/ui"]
};

export default nextConfig;
