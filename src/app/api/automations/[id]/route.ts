import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { updateAutomationSchema } from "@/lib/validators/automation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const automation = await prisma.automation.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        longDescription: true,
        domain: true,
        complexity: true,
        tier: true,
        status: true,
        version: true,
        setupTime: true,
        priceStarter: true,
        pricePro: true,
        priceAgency: true,
        avgRating: true,
        reviewCount: true,
        totalSales: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        creator: {
          select: {
            id: true,
            displayName: true,
            isVerified: true,
            user: { select: { name: true, avatarUrl: true } },
          },
        },
        platforms: {
          select: { platform: { select: { id: true, name: true, slug: true, iconUrl: true } } },
        },
        tools: {
          select: { tool: { select: { id: true, name: true, slug: true, iconUrl: true } } },
        },
        aiModels: {
          select: { aiModel: { select: { id: true, name: true, provider: true } } },
        },
        tags: {
          select: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    if (!automation) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(automation);
  } catch (error) {
    console.error("GET /api/automations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch automation" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.creatorProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify ownership
    const existing = await prisma.automation.findFirst({
      where: { id, creatorId: user.creatorProfile.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateAutomationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { platformIds, toolIds, aiModelIds, tagIds, ...automationData } =
      parsed.data;

    await prisma.$transaction(async (tx) => {
      await tx.automation.update({
        where: { id },
        data: automationData,
      });

      if (platformIds) {
        await tx.automationPlatform.deleteMany({ where: { automationId: id } });
        await tx.automationPlatform.createMany({
          data: platformIds.map((pid) => ({ automationId: id, platformId: pid })),
        });
      }

      if (toolIds) {
        await tx.automationTool.deleteMany({ where: { automationId: id } });
        await tx.automationTool.createMany({
          data: toolIds.map((tid) => ({ automationId: id, toolId: tid })),
        });
      }

      if (aiModelIds) {
        await tx.automationAiModel.deleteMany({ where: { automationId: id } });
        await tx.automationAiModel.createMany({
          data: aiModelIds.map((aid) => ({ automationId: id, aiModelId: aid })),
        });
      }

      if (tagIds) {
        await tx.automationTag.deleteMany({ where: { automationId: id } });
        await tx.automationTag.createMany({
          data: tagIds.map((tid) => ({ automationId: id, tagId: tid })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/automations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update automation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.creatorProfile && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const where: Record<string, string> = { id };
    if (user.role !== "ADMIN" && user.creatorProfile) {
      where.creatorId = user.creatorProfile.id;
    }

    const automation = await prisma.automation.findFirst({
      where,
      select: { id: true, status: true },
    });

    if (!automation) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 }
      );
    }

    if (automation.status === "PUBLISHED" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete a published automation" },
        { status: 400 }
      );
    }

    await prisma.automation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/automations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete automation" },
      { status: 500 }
    );
  }
}
