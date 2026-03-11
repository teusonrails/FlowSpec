import Link from "next/link";
import { Plus, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireCreator } from "@/lib/auth/session";
import { getCreatorAutomations } from "@/lib/data/creators";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { DOMAIN_CONFIG } from "@/lib/utils/constants";
import type { Domain, AutomationStatus } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Automations - FlowSpec",
};

const statusColors: Record<AutomationStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  VALIDATED: "bg-blue-500/10 text-blue-500",
  PUBLISHED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-red-500/10 text-red-500",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default async function CreatorAutomationsPage() {
  const user = await requireCreator();
  const automations = await getCreatorAutomations(user.creatorProfile.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Automations</h1>
        <Button asChild>
          <Link href="/dashboard/creator/automations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Automation
          </Link>
        </Button>
      </div>

      {automations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any automations yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/creator/automations/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Automation
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {automations.map((automation) => (
            <Card key={automation.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {automation.name}
                      </h3>
                      <Badge
                        className={statusColors[automation.status]}
                        variant="secondary"
                      >
                        {automation.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>
                        {DOMAIN_CONFIG[automation.domain as Domain]?.label ?? automation.domain}
                      </span>
                      <span>
                        {formatPrice(automation.priceStarter)}
                      </span>
                      <span>{automation.totalSales} sales</span>
                      {automation.avgRating > 0 && (
                        <span>{automation.avgRating.toFixed(1)} rating</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {formatDate(automation.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/creator/automations/${automation.id}/edit`}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </Button>
                    {automation.status === "PUBLISHED" && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/catalog/${automation.slug}`}>
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
