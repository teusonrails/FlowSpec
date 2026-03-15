"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { requireCreator, requireAdmin } from "@/lib/auth/session";
import {
  createAutomationSchema,
  updateAutomationSchema,
} from "@/lib/validators/automation";
import type { AutomationStatus } from "@/generated/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.automation.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function createAutomation(formData: FormData) {
  const user = await requireCreator();

  const raw = Object.fromEntries(formData.entries());
  // Parse arrays from form data
  const data = {
    ...raw,
    setupTime: raw.setupTime ? Number(raw.setupTime) : undefined,
    priceStarter: raw.priceStarter ? Number(raw.priceStarter) : undefined,
    pricePro: raw.pricePro ? Number(raw.pricePro) : undefined,
    priceAgency: raw.priceAgency ? Number(raw.priceAgency) : undefined,
    platformIds: formData.getAll("platformIds") as string[],
    toolIds: formData.getAll("toolIds") as string[],
    aiModelIds: formData.getAll("aiModelIds") as string[],
    tagIds: formData.getAll("tagIds") as string[],
  };

  const parsed = createAutomationSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  const {
    platformIds,
    toolIds,
    aiModelIds,
    tagIds,
    ...automationData
  } = parsed.data;

  const slug = await ensureUniqueSlug(generateSlug(automationData.name));

  const automation = await prisma.automation.create({
    data: {
      ...automationData,
      slug,
      creatorId: user.creatorProfile.id,
      status: "DRAFT",
      platforms: {
        create: platformIds.map((id) => ({ platformId: id })),
      },
      ...(toolIds?.length && {
        tools: {
          create: toolIds.map((id) => ({ toolId: id })),
        },
      }),
      ...(aiModelIds?.length && {
        aiModels: {
          create: aiModelIds.map((id) => ({ aiModelId: id })),
        },
      }),
      ...(tagIds?.length && {
        tags: {
          create: tagIds.map((id) => ({ tagId: id })),
        },
      }),
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/dashboard/creator/automations");
  redirect(`/dashboard/creator/automations/${automation.id}/edit`);
}

export async function updateAutomation(automationId: string, formData: FormData) {
  const user = await requireCreator();

  // Verify ownership
  const existing = await prisma.automation.findFirst({
    where: { id: automationId, creatorId: user.creatorProfile.id },
    select: { id: true, status: true },
  });

  if (!existing) {
    return { error: "Automation not found" };
  }

  const raw = Object.fromEntries(formData.entries());
  const data = {
    ...raw,
    setupTime: raw.setupTime ? Number(raw.setupTime) : undefined,
    priceStarter: raw.priceStarter ? Number(raw.priceStarter) : undefined,
    pricePro: raw.pricePro ? Number(raw.pricePro) : undefined,
    priceAgency: raw.priceAgency ? Number(raw.priceAgency) : undefined,
    platformIds: formData.getAll("platformIds") as string[],
    toolIds: formData.getAll("toolIds") as string[],
    aiModelIds: formData.getAll("aiModelIds") as string[],
    tagIds: formData.getAll("tagIds") as string[],
  };

  const parsed = updateAutomationSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  const { platformIds, toolIds, aiModelIds, tagIds, ...automationData } =
    parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.automation.update({
      where: { id: automationId },
      data: automationData,
    });

    if (platformIds) {
      await tx.automationPlatform.deleteMany({ where: { automationId } });
      await tx.automationPlatform.createMany({
        data: platformIds.map((id) => ({
          automationId,
          platformId: id,
        })),
      });
    }

    if (toolIds) {
      await tx.automationTool.deleteMany({ where: { automationId } });
      await tx.automationTool.createMany({
        data: toolIds.map((id) => ({
          automationId,
          toolId: id,
        })),
      });
    }

    if (aiModelIds) {
      await tx.automationAiModel.deleteMany({ where: { automationId } });
      await tx.automationAiModel.createMany({
        data: aiModelIds.map((id) => ({
          automationId,
          aiModelId: id,
        })),
      });
    }

    if (tagIds) {
      await tx.automationTag.deleteMany({ where: { automationId } });
      await tx.automationTag.createMany({
        data: tagIds.map((id) => ({
          automationId,
          tagId: id,
        })),
      });
    }
  });

  revalidatePath("/dashboard/creator/automations");
  revalidatePath(`/catalog/${existing.status === "PUBLISHED" ? automationId : ""}`);

  return { success: true };
}

export async function submitForReview(automationId: string) {
  const user = await requireCreator();

  const automation = await prisma.automation.findFirst({
    where: {
      id: automationId,
      creatorId: user.creatorProfile.id,
      status: "DRAFT",
    },
    select: { id: true },
  });

  if (!automation) {
    return { error: "Automation not found or not in draft status" };
  }

  await prisma.automation.update({
    where: { id: automationId },
    data: { status: "PENDING_REVIEW" },
  });

  revalidatePath("/dashboard/creator/automations");
  return { success: true };
}

export async function deleteAutomation(automationId: string) {
  const user = await requireCreator();

  const automation = await prisma.automation.findFirst({
    where: {
      id: automationId,
      creatorId: user.creatorProfile.id,
    },
    select: { id: true, status: true },
  });

  if (!automation) {
    return { error: "Automation not found" };
  }

  if (automation.status === "PUBLISHED") {
    return { error: "Cannot delete a published automation. Archive it instead." };
  }

  await prisma.automation.delete({ where: { id: automationId } });

  revalidatePath("/dashboard/creator/automations");
  return { success: true };
}

export async function archiveAutomation(automationId: string) {
  const user = await requireCreator();

  const automation = await prisma.automation.findFirst({
    where: {
      id: automationId,
      creatorId: user.creatorProfile.id,
      status: "PUBLISHED",
    },
    select: { id: true, slug: true },
  });

  if (!automation) {
    return { error: "Automation not found or not published" };
  }

  await prisma.automation.update({
    where: { id: automationId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/dashboard/creator/automations");
  revalidatePath(`/catalog/${automation.slug}`);
  revalidatePath("/catalog");
  return { success: true };
}

// Admin actions

export async function adminUpdateStatus(
  automationId: string,
  status: AutomationStatus
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const existing = await prisma.automation.findUnique({
    where: { id: automationId },
    select: { id: true },
  });

  if (!existing) {
    return { success: false, error: "Automation not found" };
  }

  const data: Record<string, unknown> = { status };
  if (status === "PUBLISHED") {
    data.publishedAt = new Date();
  }

  await prisma.automation.update({
    where: { id: automationId },
    data,
  });

  revalidatePath("/dashboard/admin/submissions");
  revalidatePath("/catalog");
  return { success: true };
}
