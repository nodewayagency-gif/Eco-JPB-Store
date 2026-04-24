import type { MetadataRoute } from "next";
import { products, productSlug } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteConfig.url}/produtos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteConfig.url}/sobre`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    }
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/produtos/${productSlug(product)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8
  }));

  return [...staticRoutes, ...productRoutes];
}
