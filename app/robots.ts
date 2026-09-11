import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/progettista", "/azienda"],
      disallow: [
        "/admin/",
        "/api/",
        "/dashboard/",
        "/login",
        "/forgot-password",
      ],
    },
    sitemap: "https://engineering.quicksolve.it/sitemap.xml",
    host: "https://engineering.quicksolve.it",
  };
}