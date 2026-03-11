"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireAuth, requireCreator } from "@/lib/auth/session";
import { z } from "zod/v4";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

const updateCreatorProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
});

const createCreatorProfileSchema = z.object({
  displayName: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name") as string || undefined,
    avatarUrl: formData.get("avatarUrl") as string || undefined,
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateCreatorProfile(formData: FormData) {
  const user = await requireCreator();

  const raw = {
    displayName: formData.get("displayName") as string,
    bio: formData.get("bio") as string || undefined,
    website: formData.get("website") as string || "",
    githubUrl: formData.get("githubUrl") as string || "",
    twitterUrl: formData.get("twitterUrl") as string || "",
  };

  const parsed = updateCreatorProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  // Convert empty strings to null for URL fields
  const data = {
    ...parsed.data,
    website: parsed.data.website || null,
    githubUrl: parsed.data.githubUrl || null,
    twitterUrl: parsed.data.twitterUrl || null,
  };

  await prisma.creatorProfile.update({
    where: { id: user.creatorProfile.id },
    data,
  });

  revalidatePath("/dashboard/creator/profile");
  return { success: true };
}

export async function becomeCreator(formData: FormData) {
  const user = await requireAuth();

  if (user.role === "CREATOR" || user.role === "ADMIN") {
    return { error: "You are already a creator" };
  }

  const raw = {
    displayName: formData.get("displayName") as string,
    bio: formData.get("bio") as string || undefined,
  };

  const parsed = createCreatorProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.format() };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { role: "CREATOR" },
    });

    await tx.creatorProfile.create({
      data: {
        userId: user.id,
        displayName: parsed.data.displayName,
        bio: parsed.data.bio,
      },
    });
  });

  revalidatePath("/dashboard");
  return { success: true };
}
