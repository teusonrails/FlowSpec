import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://flowspec.app";

  // Fetch all published automation slugs
  const automations = await prisma.automation.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  // Fetch all creators with published automations
  const creators = await prisma.creatorProfile.findMany({
    where: { automations: { some: { status: "PUBLISHED" } } },
    select: { id: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${appUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${appUrl}/creators`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const automationPages: MetadataRoute.Sitemap = automations.map(
    (automation) => ({
      url: `${appUrl}/catalog/${automation.slug}`,
      lastModified: automation.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  const creatorPages: MetadataRoute.Sitemap = creators.map((creator) => ({
    url: `${appUrl}/creators/${creator.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...automationPages, ...creatorPages];
}
