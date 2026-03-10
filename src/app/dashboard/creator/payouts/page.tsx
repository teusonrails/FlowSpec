import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Payouts - FlowSpec",
};

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payouts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your payout history will appear here. Connect your Stripe account to
            receive payouts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
