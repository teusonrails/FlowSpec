import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { createLoginLink } from "@/lib/stripe/connect";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "CREATOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: user.id },
      select: { stripeAccountId: true },
    });

    if (!profile?.stripeAccountId) {
      return NextResponse.json(
        { error: "Stripe account not connected" },
        { status: 400 }
      );
    }

    const url = await createLoginLink(profile.stripeAccountId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/connect/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to create dashboard link" },
      { status: 500 }
    );
  }
}
