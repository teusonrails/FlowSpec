import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { browseAutomations } from "@/lib/data/automations";
import type { Domain, Complexity } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const q = searchParams.get("q") || undefined;
    const domain = searchParams.getAll("domain") as Domain[];
    const complexity = searchParams.getAll("complexity") as Complexity[];
    const platform = searchParams.getAll("platform");
    const tool = searchParams.getAll("tool");
    const sort = (searchParams.get("sort") as "newest" | "popular" | "rating" | "price_asc" | "price_desc") || undefined;
    const page = Number(searchParams.get("page")) || 1;

    const data = await browseAutomations({
      q,
      domain: domain.length ? domain : undefined,
      complexity: complexity.length ? complexity : undefined,
      platform: platform.length ? platform : undefined,
      tool: tool.length ? tool : undefined,
      sort,
      page,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/automations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch automations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getCurrentUser } = await import("@/lib/auth/session");
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "CREATOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!user.creatorProfile) {
      return NextResponse.json(
        { error: "Creator profile required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { createAutomationSchema } = await import(
      "@/lib/validators/automation"
    );

    const parsed = createAutomationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/prisma/client");
    const { platformIds, toolIds, aiModelIds, tagIds, ...automationData } =
      parsed.data;

    const slug = automationData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80);

    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (
      await prisma.automation.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      })
    ) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const automation = await prisma.automation.create({
      data: {
        ...automationData,
        slug: finalSlug,
        creatorId: user.creatorProfile.id,
        status: "DRAFT",
        platforms: {
          create: platformIds.map((id) => ({ platformId: id })),
        },
        ...(toolIds?.length && {
          tools: { create: toolIds.map((id) => ({ toolId: id })) },
        }),
        ...(aiModelIds?.length && {
          aiModels: { create: aiModelIds.map((id) => ({ aiModelId: id })) },
        }),
        ...(tagIds?.length && {
          tags: { create: tagIds.map((id) => ({ tagId: id })) },
        }),
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error("POST /api/automations error:", error);
    return NextResponse.json(
      { error: "Failed to create automation" },
      { status: 500 }
    );
  }
}
