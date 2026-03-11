import type { Metadata } from "next";
import { requireCreator } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { AutomationForm } from "@/components/dashboard/automation-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Automation - FlowSpec",
};

export default async function NewAutomationPage() {
  await requireCreator();

  const [platforms, tools, aiModels, tags] = await Promise.all([
    prisma.platform.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.tool.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.aiModel.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Automation</h1>
      <AutomationForm
        platforms={platforms}
        tools={tools}
        aiModels={aiModels}
        tags={tags}
      />
    </div>
  );
}
