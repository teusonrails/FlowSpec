import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import {
  createConnectAccount,
  createAccountLink,
} from "@/lib/stripe/connect";

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
      select: { id: true, stripeAccountId: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 404 }
      );
    }

    let stripeAccountId = profile.stripeAccountId;

    if (!stripeAccountId) {
      stripeAccountId = await createConnectAccount(
        profile.id,
        user.id,
        user.email
      );
    }

    const url = await createAccountLink(stripeAccountId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/connect/onboard error:", error);
    return NextResponse.json(
      { error: "Failed to create onboarding link" },
      { status: 500 }
    );
  }
}
