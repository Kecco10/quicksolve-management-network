import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/manager", "/azienda"],
      disallow: [
        "/admin/",
        "/api/",
        "/manager/dashboard/",
        "/manager/login",
      ],
    },
    sitemap: "https://management.quicksolve.it/sitemap.xml",
    host: "https://management.quicksolve.it",
  };
}