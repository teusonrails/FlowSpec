import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "My Automations - FlowSpec",
};

export default function CreatorAutomationsPage() {
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

      <Card>
        <CardHeader>
          <CardTitle>Your Automations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any automations yet. Click &quot;New
            Automation&quot; to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
