"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireAuth } from "@/lib/auth/session";
import { createReviewSchema } from "@/lib/validators/review";

export async function createReview(automationId: string, formData: FormData) {
  const user = await requireAuth();

  // Check if user has purchased this automation
  const purchase = await prisma.purchase.findUnique({
    where: {
      buyerId_automationId: {
        buyerId: user.id,
        automationId,
      },
    },
    select: { status: true },
  });

  if (!purchase || purchase.status !== "COMPLETED") {
    return { error: "You must purchase this automation before reviewing it" };
  }

  // Check for existing review
  const existing = await prisma.review.findUnique({
    where: {
      userId_automationId: {
        userId: user.id,
        automationId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return { error: "You have already reviewed this automation" };
  }

  const raw = {
    rating: Number(formData.get("rating")),
    title: formData.get("title") as string || undefined,
    body: formData.get("body") as string || undefined,
  };

  const parsed = createReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        userId: user.id,
        automationId,
        ...parsed.data,
      },
    });

    // Update denormalized stats
    const stats = await tx.review.aggregate({
      where: { automationId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.automation.update({
      where: { id: automationId },
      data: {
        avgRating: stats._avg.rating ?? 0,
        reviewCount: stats._count,
      },
    });
  });

  const automation = await prisma.automation.findUnique({
    where: { id: automationId },
    select: { slug: true },
  });

  revalidatePath(`/catalog/${automation?.slug}`);
  revalidatePath("/dashboard/purchases");

  return { success: true };
}

export async function updateReview(reviewId: string, formData: FormData) {
  const user = await requireAuth();

  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId: user.id },
    select: { id: true, automationId: true },
  });

  if (!review) {
    return { error: "Review not found" };
  }

  const raw = {
    rating: Number(formData.get("rating")),
    title: formData.get("title") as string || undefined,
    body: formData.get("body") as string || undefined,
  };

  const parsed = createReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: reviewId },
      data: parsed.data,
    });

    const stats = await tx.review.aggregate({
      where: { automationId: review.automationId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.automation.update({
      where: { id: review.automationId },
      data: {
        avgRating: stats._avg.rating ?? 0,
        reviewCount: stats._count,
      },
    });
  });

  const automation = await prisma.automation.findUnique({
    where: { id: review.automationId },
    select: { slug: true },
  });

  revalidatePath(`/catalog/${automation?.slug}`);
  revalidatePath("/dashboard/purchases");

  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const user = await requireAuth();

  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId: user.id },
    select: { id: true, automationId: true },
  });

  if (!review) {
    return { error: "Review not found" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });

    const stats = await tx.review.aggregate({
      where: { automationId: review.automationId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.automation.update({
      where: { id: review.automationId },
      data: {
        avgRating: stats._avg.rating ?? 0,
        reviewCount: stats._count,
      },
    });
  });

  const automation = await prisma.automation.findUnique({
    where: { id: review.automationId },
    select: { slug: true },
  });

  revalidatePath(`/catalog/${automation?.slug}`);
  revalidatePath("/dashboard/purchases");

  return { success: true };
}
