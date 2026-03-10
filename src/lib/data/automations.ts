import { prisma } from "@/lib/prisma/client";
import type { BrowseParams, BrowseResponse, FilterCount } from "@/lib/types/api";
import type { AutomationCard } from "@/lib/types/database";
import { ITEMS_PER_PAGE, MAX_ITEMS_PER_PAGE } from "@/lib/utils/constants";
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

function buildWhere(params: BrowseParams): Prisma.AutomationWhereInput {
  const where: Prisma.AutomationWhereInput = {
    status: "PUBLISHED",
  };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.domain?.length) {
    where.domain = { in: params.domain };
  }

  if (params.complexity?.length) {
    where.complexity = { in: params.complexity };
  }

  if (params.tier?.length) {
    where.tier = { in: params.tier };
  }

  if (params.platform?.length) {
    where.platforms = {
      some: { platform: { slug: { in: params.platform } } },
    };
  }

  if (params.tool?.length) {
    where.tools = {
      some: { tool: { slug: { in: params.tool } } },
    };
  }

  if (params.aiModel?.length) {
    where.aiModels = {
      some: { aiModel: { name: { in: params.aiModel } } },
    };
  }

  if (params.rating) {
    where.avgRating = { gte: params.rating };
  }

  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    where.priceStarter = {};
    if (params.priceMin !== undefined) {
      where.priceStarter.gte = params.priceMin;
    }
    if (params.priceMax !== undefined) {
      where.priceStarter.lte = params.priceMax;
    }
  }

  return where;
}

function buildOrderBy(
  sort: BrowseParams["sort"]
): Prisma.AutomationOrderByWithRelationInput {
  switch (sort) {
    case "popular":
      return { totalSales: "desc" };
    case "rating":
      return { avgRating: "desc" };
    case "price_asc":
      return { priceStarter: { sort: "asc", nulls: "first" } };
    case "price_desc":
      return { priceStarter: { sort: "desc", nulls: "last" } };
    case "newest":
    default:
      return { publishedAt: { sort: "desc", nulls: "last" } };
  }
}

export async function browseAutomations(
  params: BrowseParams
): Promise<BrowseResponse> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(MAX_ITEMS_PER_PAGE, Math.max(1, params.limit ?? ITEMS_PER_PAGE));
  const skip = (page - 1) * limit;
  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);

  const [automations, total, domainCounts, platformCounts, complexityCounts, toolCounts] =
    await Promise.all([
      prisma.automation.findMany({
        where,
        select: automationCardSelect,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.automation.count({ where }),
      // Domain filter counts
      prisma.automation.groupBy({
        by: ["domain"],
        where: { status: "PUBLISHED" },
        _count: true,
      }),
      // Platform filter counts
      prisma.automationPlatform.groupBy({
        by: ["platformId"],
        where: { automation: { status: "PUBLISHED" } },
        _count: true,
      }),
      // Complexity filter counts
      prisma.automation.groupBy({
        by: ["complexity"],
        where: { status: "PUBLISHED" },
        _count: true,
      }),
      // Tool filter counts
      prisma.automationTool.groupBy({
        by: ["toolId"],
        where: { automation: { status: "PUBLISHED" } },
        _count: true,
      }),
    ]);

  // Resolve platform names for filter counts
  const platformIds = platformCounts.map((p) => p.platformId);
  const platformNames = platformIds.length
    ? await prisma.platform.findMany({
        where: { id: { in: platformIds } },
        select: { id: true, slug: true },
      })
    : [];
  const platformIdToSlug = new Map(platformNames.map((p) => [p.id, p.slug]));

  // Resolve tool names for filter counts
  const toolIds = toolCounts.map((t) => t.toolId);
  const toolNames = toolIds.length
    ? await prisma.tool.findMany({
        where: { id: { in: toolIds } },
        select: { id: true, slug: true },
      })
    : [];
  const toolIdToSlug = new Map(toolNames.map((t) => [t.id, t.slug]));

  return {
    automations: automations as AutomationCard[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    filters: {
      domains: domainCounts.map((d) => ({
        value: d.domain,
        count: d._count,
      })),
      platforms: platformCounts
        .map((p) => ({
          value: platformIdToSlug.get(p.platformId) ?? p.platformId,
          count: p._count,
        }))
        .sort((a, b) => b.count - a.count),
      complexities: complexityCounts.map((c) => ({
        value: c.complexity,
        count: c._count,
      })),
      tools: toolCounts
        .map((t) => ({
          value: toolIdToSlug.get(t.toolId) ?? t.toolId,
          count: t._count,
        }))
        .sort((a, b) => b.count - a.count),
    },
  };
}

export async function getAutomationBySlug(slug: string) {
  return prisma.automation.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      longDescription: true,
      domain: true,
      complexity: true,
      tier: true,
      version: true,
      setupTime: true,
      successRate: true,
      priceStarter: true,
      pricePro: true,
      priceAgency: true,
      avgRating: true,
      reviewCount: true,
      totalSales: true,
      downloadCount: true,
      viewCount: true,
      publishedAt: true,
      creator: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          isVerified: true,
          user: { select: { name: true, avatarUrl: true } },
          _count: { select: { automations: true } },
        },
      },
      platforms: {
        select: { platform: { select: { id: true, name: true, slug: true, iconUrl: true } } },
      },
      tools: {
        select: { tool: { select: { id: true, name: true, slug: true, iconUrl: true, category: true } } },
      },
      aiModels: {
        select: { aiModel: { select: { id: true, name: true, provider: true } } },
      },
      tags: {
        select: { tag: { select: { id: true, name: true, slug: true } } },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          user: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getFilterOptions() {
  const [platforms, tools, aiModels] = await Promise.all([
    prisma.platform.findMany({
      select: { slug: true, name: true, iconUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.tool.findMany({
      select: { slug: true, name: true, iconUrl: true, category: true },
      orderBy: { name: "asc" },
    }),
    prisma.aiModel.findMany({
      select: { name: true, provider: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { platforms, tools, aiModels };
}
