import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireCreator } from "@/lib/auth/session";
import { getCreatorAutomationById } from "@/lib/data/creators";
import { prisma } from "@/lib/prisma/client";
import { AutomationForm } from "@/components/dashboard/automation-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Automation - FlowSpec",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAutomationPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireCreator();

  const automation = await getCreatorAutomationById(id, user.creatorProfile.id);
  if (!automation) notFound();

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
      <h1 className="text-2xl font-bold">Edit Automation</h1>
      <AutomationForm
        automationId={automation.id}
        defaultValues={{
          name: automation.name,
          description: automation.description,
          longDescription: automation.longDescription ?? "",
          domain: automation.domain,
          complexity: automation.complexity,
          tier: automation.tier,
          version: automation.version,
          setupTime: automation.setupTime ?? undefined,
          priceStarter: automation.priceStarter ?? undefined,
          pricePro: automation.pricePro ?? undefined,
          priceAgency: automation.priceAgency ?? undefined,
          flowspecContent: automation.flowspecContent ?? "",
          platformIds: automation.platforms.map((p) => p.platformId),
          toolIds: automation.tools.map((t) => t.toolId),
          aiModelIds: automation.aiModels.map((a) => a.aiModelId),
          tagIds: automation.tags.map((t) => t.tagId),
        }}
        status={automation.status}
        platforms={platforms}
        tools={tools}
        aiModels={aiModels}
        tags={tags}
      />
    </div>
  );
}
