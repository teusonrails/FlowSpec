import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Download, Star } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard - FlowSpec",
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const [purchaseCount, reviewCount, totalDownloads] = await Promise.all([
    prisma.purchase.count({
      where: { buyerId: user.id, status: "COMPLETED" },
    }),
    prisma.review.count({ where: { userId: user.id } }),
    prisma.purchase.aggregate({
      where: { buyerId: user.id, status: "COMPLETED" },
      _sum: { downloadCount: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseCount}</div>
            <p className="text-xs text-muted-foreground">Total purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDownloads._sum.downloadCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Total downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewCount}</div>
            <p className="text-xs text-muted-foreground">Reviews given</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
