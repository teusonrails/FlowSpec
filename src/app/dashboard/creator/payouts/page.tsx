import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireCreator } from "@/lib/auth/session";
import { getCreatorEarnings } from "@/lib/data/creators";
import { formatPrice } from "@/lib/utils/format";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payouts - FlowSpec",
};

export default async function PayoutsPage() {
  const user = await requireCreator();
  const earnings = await getCreatorEarnings(user.creatorProfile.id);

  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { id: user.creatorProfile.id },
    select: { stripeAccountId: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payouts</h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(earnings.totalEarnings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Stripe Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={creatorProfile?.stripeAccountId ? "default" : "secondary"}
            >
              {creatorProfile?.stripeAccountId ? "Connected" : "Not Connected"}
            </Badge>
            {!creatorProfile?.stripeAccountId && (
              <p className="text-sm text-muted-foreground mt-2">
                Connect your Stripe account to receive payouts.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.recentSales.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sales yet. Publish an automation to start earning.
            </p>
          ) : (
            <div className="space-y-3">
              {earnings.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                >
                  <div>
                    <span className="font-medium">{sale.automation.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ({sale.tier})
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatPrice(sale.creatorEarnings)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
