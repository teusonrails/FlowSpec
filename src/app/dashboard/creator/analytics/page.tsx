import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCreator } from "@/lib/auth/session";
import { getCreatorEarnings } from "@/lib/data/creators";
import { formatPrice } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics - FlowSpec",
};

export default async function AnalyticsPage() {
  const user = await requireCreator();
  const earnings = await getCreatorEarnings(user.creatorProfile.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {earnings.automationStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Publish an automation to see analytics here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
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
                <p className="text-sm text-muted-foreground">
                  From {earnings.totalSales} sales
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earnings.automationStats.map((automation) => (
                  <div
                    key={automation.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{automation.name}</span>
                    <div className="text-right text-muted-foreground">
                      <span>{automation.totalSales} sales</span>
                      <span className="ml-4 font-medium text-foreground">
                        {formatPrice(automation.totalRevenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
