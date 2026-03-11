import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@/generated/prisma";

const automationCardSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  domain: true,
  complexity: true,
  tier: true,
  priceStarter: true,
  pricePro: true,
  priceAgency: true,
  avgRating: true,
  reviewCount: true,
  totalSales: true,
  creator: {
    select: {
      id: true,
      displayName: true,
      user: {
        select: { avatarUrl: true },
      },
    },
  },
  platforms: {
    select: {
      platform: {
        select: { name: true, slug: true, iconUrl: true },
      },
    },
  },
} satisfies Prisma.AutomationSelect;

/** Get a creator's public profile by user ID */
export async function getCreatorProfile(userId: string) {
  return prisma.creatorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      displayName: true,
      bio: true,
      website: true,
      githubUrl: true,
      twitterUrl: true,
      isVerified: true,
      createdAt: true,
      user: {
        select: { name: true, avatarUrl: true },
      },
      _count: {
        select: { automations: true },
      },
    },
  });
}

/** Get a creator's public profile by profile ID with published automations */
export async function getCreatorPublicProfile(profileId: string) {
  return prisma.creatorProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      displayName: true,
      bio: true,
      website: true,
      githubUrl: true,
      twitterUrl: true,
      isVerified: true,
      createdAt: true,
      user: {
        select: { name: true, avatarUrl: true },
      },
      automations: {
        where: { status: "PUBLISHED" },
        select: automationCardSelect,
        orderBy: { publishedAt: "desc" },
      },
      _count: {
        select: { automations: { where: { status: "PUBLISHED" } } },
      },
    },
  });
}

/** Get all automations for a creator (including drafts, for dashboard) */
export async function getCreatorAutomations(creatorProfileId: string) {
  return prisma.automation.findMany({
    where: { creatorId: creatorProfileId },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      domain: true,
      tier: true,
      priceStarter: true,
      totalSales: true,
      totalRevenue: true,
      avgRating: true,
      reviewCount: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** Get a single automation by ID for editing (creator must own it) */
export async function getCreatorAutomationById(
  automationId: string,
  creatorProfileId: string
) {
  return prisma.automation.findFirst({
    where: {
      id: automationId,
      creatorId: creatorProfileId,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      longDescription: true,
      domain: true,
      complexity: true,
      tier: true,
      status: true,
      version: true,
      setupTime: true,
      priceStarter: true,
      pricePro: true,
      priceAgency: true,
      flowspecContent: true,
      packageUrl: true,
      platforms: { select: { platformId: true } },
      tools: { select: { toolId: true } },
      aiModels: { select: { aiModelId: true } },
      tags: { select: { tagId: true } },
    },
  });
}

/** Get creator earnings summary */
export async function getCreatorEarnings(creatorProfileId: string) {
  const [totalEarnings, recentSales, automationStats] = await Promise.all([
    prisma.purchase.aggregate({
      where: {
        automation: { creatorId: creatorProfileId },
        status: "COMPLETED",
      },
      _sum: { creatorEarnings: true },
      _count: true,
    }),
    prisma.purchase.findMany({
      where: {
        automation: { creatorId: creatorProfileId },
        status: "COMPLETED",
      },
      select: {
        id: true,
        amountPaid: true,
        creatorEarnings: true,
        tier: true,
        createdAt: true,
        automation: {
          select: { name: true, slug: true },
        },
        buyer: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.automation.findMany({
      where: { creatorId: creatorProfileId, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        totalSales: true,
        totalRevenue: true,
      },
      orderBy: { totalRevenue: "desc" },
    }),
  ]);

  return {
    totalEarnings: totalEarnings._sum.creatorEarnings ?? 0,
    totalSales: totalEarnings._count,
    recentSales,
    automationStats,
  };
}
