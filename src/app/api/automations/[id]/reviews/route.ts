import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { createReviewSchema } from "@/lib/validators/review";
import { getAutomationReviews } from "@/lib/data/reviews";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    const data = await getAutomationReviews(id, page, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/automations/[id]/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: automationId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must have purchased
    const purchase = await prisma.purchase.findUnique({
      where: {
        buyerId_automationId: { buyerId: user.id, automationId },
      },
      select: { status: true },
    });

    if (!purchase || purchase.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You must purchase this automation before reviewing" },
        { status: 403 }
      );
    }

    // Must not have reviewed already
    const existing = await prisma.review.findUnique({
      where: {
        userId_automationId: { userId: user.id, automationId },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this automation" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          userId: user.id,
          automationId,
          ...parsed.data,
        },
        select: { id: true, rating: true, title: true, body: true, createdAt: true },
      });

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

      return created;
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/automations/[id]/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
