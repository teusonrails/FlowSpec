import { prisma } from "@/lib/prisma/client";

/** Get all reviews for an automation */
export async function getAutomationReviews(
  automationId: string,
  page = 1,
  limit = 10
) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { automationId },
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: { name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where: { automationId } }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/** Get all reviews by a user */
export async function getUserReviews(userId: string) {
  return prisma.review.findMany({
    where: { userId },
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      automation: {
        select: {
          id: true,
          slug: true,
          name: true,
          domain: true,
          creator: {
            select: { displayName: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Check if a user has already reviewed an automation */
export async function hasReviewed(userId: string, automationId: string) {
  const review = await prisma.review.findUnique({
    where: {
      userId_automationId: {
        userId,
        automationId,
      },
    },
    select: { id: true },
  });

  return !!review;
}

/** Get a user's review for a specific automation */
export async function getUserReviewForAutomation(
  userId: string,
  automationId: string
) {
  return prisma.review.findUnique({
    where: {
      userId_automationId: {
        userId,
        automationId,
      },
    },
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      createdAt: true,
    },
  });
}
