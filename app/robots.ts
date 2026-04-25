import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/spasibo/", "/api/", "/_next/", "/tma/", "/admin/"],
      },
    ],
    sitemap: "https://primeclean.by/sitemap.xml",
    host: "https://primeclean.by",
  };
}
