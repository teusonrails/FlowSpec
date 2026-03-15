import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { automationId } = await request.json();
    if (!automationId) {
      return NextResponse.json(
        { error: "automationId is required" },
        { status: 400 }
      );
    }

    const automation = await prisma.automation.findUnique({
      where: { id: automationId, status: "PUBLISHED" },
      select: {
        id: true,
        tier: true,
        priceStarter: true,
        pricePro: true,
        priceAgency: true,
      },
    });

    if (!automation) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 }
      );
    }

    // Verify it's actually free
    const isFree =
      automation.tier === "FREE" ||
      (!automation.priceStarter &&
        !automation.pricePro &&
        !automation.priceAgency);

    if (!isFree) {
      return NextResponse.json(
        { error: "This automation is not free" },
        { status: 400 }
      );
    }

    // Check if already claimed
    const existing = await prisma.purchase.findUnique({
      where: {
        buyerId_automationId: { buyerId: user.id, automationId },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already claimed" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.purchase.create({
        data: {
          buyerId: user.id,
          automationId,
          tier: "FREE",
          amountPaid: 0,
          platformFee: 0,
          creatorEarnings: 0,
          status: "COMPLETED",
        },
      }),
      prisma.automation.update({
        where: { id: automationId },
        data: { totalSales: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/checkout/claim-free error:", error);
    return NextResponse.json(
      { error: "Failed to claim automation" },
      { status: 500 }
    );
  }
}
