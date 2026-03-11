import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, ShoppingBag, Star, Plus } from "lucide-react";
import { requireCreator } from "@/lib/auth/session";
import { getCreatorEarnings } from "@/lib/data/creators";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Creator Studio - FlowSpec",
};

export default async function CreatorDashboardPage() {
  const user = await requireCreator();
  const earnings = await getCreatorEarnings(user.creatorProfile.id);

  const automationCount = await prisma.automation.count({
    where: { creatorId: user.creatorProfile.id },
  });

  const avgRating = await prisma.automation.aggregate({
    where: {
      creatorId: user.creatorProfile.id,
      status: "PUBLISHED",
      reviewCount: { gt: 0 },
    },
    _avg: { avgRating: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Creator Studio</h1>
        <Button asChild>
          <Link href="/dashboard/creator/automations/new">
            <Plus className="mr-2 h-4 w-4" />
            New Automation
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automations</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automationCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(earnings.totalEarnings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgRating._avg.avgRating
                ? avgRating._avg.avgRating.toFixed(1)
                : "--"}
            </div>
          </CardContent>
        </Card>
      </div>

      {earnings.recentSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earnings.recentSales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">
                      {sale.automation.name}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {sale.buyer.name ?? "Anonymous"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      {formatPrice(sale.creatorEarnings)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {formatDate(sale.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
