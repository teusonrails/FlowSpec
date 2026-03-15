import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { getAccountStatus } from "@/lib/stripe/connect";

export async function GET() {
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
      return NextResponse.json({ connected: false });
    }

    const status = await getAccountStatus(profile.stripeAccountId);
    return NextResponse.json({ connected: true, ...status });
  } catch (error) {
    console.error("GET /api/connect/status error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}
