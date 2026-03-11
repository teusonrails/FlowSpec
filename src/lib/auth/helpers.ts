import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

/** Get the current Supabase auth user, or null. */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Get the current Supabase user — redirects to /login if unauthenticated. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Get the database user record linked to the current Supabase user. */
export async function getDbUser() {
  const authUser = await getUser();
  if (!authUser) return null;

  return prisma.user.findUnique({
    where: { supabaseAuthId: authUser.id },
    include: { creatorProfile: true },
  });
}

/** Require a creator role — redirects to dashboard if not a creator. */
export async function requireCreator() {
  const dbUser = await getDbUser();
  if (!dbUser) redirect("/login");
  if (dbUser.role !== "CREATOR" && dbUser.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return dbUser;
}
