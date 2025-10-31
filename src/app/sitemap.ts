import { MetadataRoute } from "next";

const siteUrl = "https://switchbai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;

  // Static pages
  const routes = [
    "",
    "/games",
    "/rent-a-game",
    "/compare",
    "/about",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === "" ? "weekly" : "monthly") as
      | "weekly"
      | "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
