import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const automation = await prisma.automation.findUnique({
      where: { id },
      select: {
        id: true,
        tier: true,
        packageUrl: true,
        flowspecContent: true,
        creator: { select: { userId: true } },
      },
    });

    if (!automation) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 }
      );
    }

    // Creator can always download their own
    const isOwner = automation.creator.userId === user.id;

    if (!isOwner) {
      // Free tier doesn't require purchase
      if (automation.tier !== "FREE") {
        const purchase = await prisma.purchase.findUnique({
          where: {
            buyerId_automationId: { buyerId: user.id, automationId: id },
          },
          select: { status: true },
        });

        if (!purchase || purchase.status !== "COMPLETED") {
          return NextResponse.json(
            { error: "Purchase required" },
            { status: 403 }
          );
        }
      }
    }

    // Update download stats
    await prisma.$transaction([
      prisma.automation.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      }),
      ...(isOwner
        ? []
        : [
            prisma.purchase.update({
              where: {
                buyerId_automationId: { buyerId: user.id, automationId: id },
              },
              data: {
                downloadCount: { increment: 1 },
                lastDownloadedAt: new Date(),
              },
            }),
          ]),
    ]);

    // Return flowspec content as download
    if (automation.flowspecContent) {
      return new NextResponse(automation.flowspecContent, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="automation-${id}.flowspec"`,
        },
      });
    }

    // If there's a package URL, redirect to it
    if (automation.packageUrl) {
      return NextResponse.redirect(automation.packageUrl);
    }

    return NextResponse.json(
      { error: "No downloadable content available" },
      { status: 404 }
    );
  } catch (error) {
    console.error("GET /api/automations/[id]/download error:", error);
    return NextResponse.json(
      { error: "Failed to download" },
      { status: 500 }
    );
  }
}
