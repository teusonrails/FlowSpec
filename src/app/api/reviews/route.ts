import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { createReviewSchema } from "@/lib/validators/review";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
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
            creator: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, ...reviewData } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "reviewId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findFirst({
      where: { id: reviewId, userId: user.id },
      select: { id: true, automationId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const parsed = createReviewSchema.safeParse(reviewData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.update({
        where: { id: reviewId },
        data: parsed.data,
      });

      const stats = await tx.review.aggregate({
        where: { automationId: existing.automationId },
        _avg: { rating: true },
        _count: true,
      });

      await tx.automation.update({
        where: { id: existing.automationId },
        data: {
          avgRating: stats._avg.rating ?? 0,
          reviewCount: stats._count,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId: user.id },
      select: { id: true, automationId: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
