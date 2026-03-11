import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import type { UserRole } from "@/generated/prisma";

type DbUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  supabaseAuthId: string;
  creatorProfile: {
    id: string;
    displayName: string;
  } | null;
};

/**
 * Get the current authenticated user with DB record.
 * Cached per-request via React cache() for deduplication.
 * Returns null if not authenticated or no DB record found.
 */
export const getCurrentUser = cache(async (): Promise<DbUser | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: authUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      supabaseAuthId: true,
      creatorProfile: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  });

  return dbUser;
});

/**
 * Require an authenticated user. Redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<DbUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Require a specific role. Redirects to /login if not authenticated,
 * or to / if the user doesn't have the required role.
 */
export async function requireRole(role: UserRole): Promise<DbUser> {
  const user = await requireAuth();
  if (user.role !== role && user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

/**
 * Require CREATOR or ADMIN role. Returns user with creatorProfile guaranteed.
 */
export async function requireCreator(): Promise<
  DbUser & { creatorProfile: NonNullable<DbUser["creatorProfile"]> }
> {
  const user = await requireAuth();
  if (user.role !== "CREATOR" && user.role !== "ADMIN") {
    redirect("/");
  }
  if (!user.creatorProfile) {
    redirect("/dashboard/creator");
  }
  return user as DbUser & {
    creatorProfile: NonNullable<DbUser["creatorProfile"]>;
  };
}

/**
 * Require ADMIN role.
 */
export async function requireAdmin(): Promise<DbUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
