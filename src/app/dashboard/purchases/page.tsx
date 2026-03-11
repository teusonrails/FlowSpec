import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Star } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { getBuyerPurchases } from "@/lib/data/purchases";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { DOMAIN_CONFIG } from "@/lib/utils/constants";
import type { Domain } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Purchases - FlowSpec",
};

export default async function PurchasesPage() {
  const user = await requireAuth();
  const purchases = await getBuyerPurchases(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Purchases</h1>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t purchased any automations yet.
            </p>
            <Button asChild>
              <Link href="/catalog">Browse Automations</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/catalog/${purchase.automation.slug}`}
                      className="font-semibold hover:underline"
                    >
                      {purchase.automation.name}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {purchase.automation.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {DOMAIN_CONFIG[purchase.automation.domain as Domain]?.label ?? purchase.automation.domain}
                      </Badge>
                      <Badge variant="outline">{purchase.tier}</Badge>
                      <span className="text-sm text-muted-foreground">
                        by {purchase.automation.creator.displayName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Purchased {formatDate(purchase.createdAt)}
                      {purchase.amountPaid > 0 && ` · ${formatPrice(purchase.amountPaid)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/api/automations/${purchase.automation.id}/download`}>
                        <Download className="mr-1.5 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/catalog/${purchase.automation.slug}`}>
                        <Star className="mr-1.5 h-4 w-4" />
                        Review
                      </Link>
                    </Button>
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
