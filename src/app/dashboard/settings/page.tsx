import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Settings - FlowSpec",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Manage your account settings and profile information.
          </p>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Profile editing will be available once connected to the database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
