import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages ship native bindings / worker scripts that Turbopack's
  // bundling breaks (pdfjs-dist's worker file in particular) — load them
  // as real Node requires instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "better-sqlite3"],
};

export default nextConfig;
