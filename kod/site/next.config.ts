import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.139', '*.local'],
  partialPrefetching: true,
  // Sayfa her açılışta taze gelsin (eski sürüm takılı kalmasın); hash'li JS/CSS ve görseller önbellekte kalır
  async headers() {
    return [
      { source: "/", headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }] },
      // Görseller 1 gün önbellekte (dosya adı değişmeden güncellenirse en geç ertesi gün yenilenir)
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
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
