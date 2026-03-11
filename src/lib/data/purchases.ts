import { prisma } from "@/lib/prisma/client";

/** Get all purchases for a buyer */
export async function getBuyerPurchases(userId: string) {
  return prisma.purchase.findMany({
    where: { buyerId: userId, status: "COMPLETED" },
    select: {
      id: true,
      tier: true,
      amountPaid: true,
      createdAt: true,
      downloadCount: true,
      lastDownloadedAt: true,
      automation: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          version: true,
          domain: true,
          creator: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Check if a user has purchased an automation */
export async function hasPurchased(userId: string, automationId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: {
      buyerId_automationId: {
        buyerId: userId,
        automationId,
      },
    },
    select: { id: true, status: true },
  });

  return purchase?.status === "COMPLETED";
}

/** Get a specific purchase */
export async function getPurchase(userId: string, automationId: string) {
  return prisma.purchase.findUnique({
    where: {
      buyerId_automationId: {
        buyerId: userId,
        automationId,
      },
    },
    select: {
      id: true,
      tier: true,
      amountPaid: true,
      status: true,
      createdAt: true,
      downloadCount: true,
      automation: {
        select: {
          id: true,
          slug: true,
          name: true,
          version: true,
        },
      },
    },
  });
}
