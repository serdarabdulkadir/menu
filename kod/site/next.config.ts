import type { NextConfig } from "next";

// Statik dışa aktarım: Netlify "out" klasörünü doğrudan yayınlar (sunucu gerekmez)
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.139", "*.local"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
