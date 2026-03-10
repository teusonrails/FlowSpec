import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "New Automation - FlowSpec",
};

export default function NewAutomationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Automation</h1>

      <Card>
        <CardHeader>
          <CardTitle>Automation Details</CardTitle>
          <CardDescription>
            Fill in the details for your new automation listing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="My Automation" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="A short description..." />
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Full automation creation form will be available once connected to the
            database.
          </p>
          <Button disabled>Create Automation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
