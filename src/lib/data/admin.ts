import { prisma } from "@/lib/prisma/client";
import type { AutomationStatus } from "@/generated/prisma";

/** Get admin dashboard stats */
export async function getAdminStats() {
  const [
    totalUsers,
    totalCreators,
    totalAutomations,
    publishedAutomations,
    pendingSubmissions,
    totalRevenue,
    totalPurchases,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CREATOR" } }),
    prisma.automation.count(),
    prisma.automation.count({ where: { status: "PUBLISHED" } }),
    prisma.automation.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amountPaid: true },
    }),
    prisma.purchase.count({ where: { status: "COMPLETED" } }),
  ]);

  return {
    totalUsers,
    totalCreators,
    totalAutomations,
    publishedAutomations,
    pendingSubmissions,
    totalRevenue: totalRevenue._sum.amountPaid ?? 0,
    totalPurchases,
  };
}

/** Get submissions for admin review */
export async function getAdminSubmissions(
  status?: AutomationStatus,
  page = 1,
  limit = 20
) {
  const where = status ? { status } : { status: { in: ["PENDING_REVIEW" as const, "VALIDATED" as const] } };

  const [submissions, total] = await Promise.all([
    prisma.automation.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        domain: true,
        complexity: true,
        tier: true,
        status: true,
        validationScore: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            displayName: true,
            isVerified: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.automation.count({ where }),
  ]);

  return {
    submissions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/** Get all users for admin management */
export async function getAdminUsers(page = 1, limit = 20) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        creatorProfile: {
          select: {
            displayName: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            purchases: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
