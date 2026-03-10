import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Purchases - FlowSpec",
};

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Purchases</h1>
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your purchased automations will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
