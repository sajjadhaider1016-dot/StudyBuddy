import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  serverExternalPackages: [
    "pdf-parse",
    "@napi-rs/canvas",
    "mammoth",
  ],

  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;