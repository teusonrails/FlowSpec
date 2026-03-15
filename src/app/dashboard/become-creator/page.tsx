import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { BecomeCreatorForm } from "@/components/dashboard/become-creator-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Become a Creator - FlowSpec",
};

export default async function BecomeCreatorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "CREATOR" || user.role === "ADMIN") {
    redirect("/dashboard/creator");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Become a Creator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Join FlowSpec Creators</CardTitle>
          <CardDescription>
            Start building and selling automation workflows on FlowSpec. Set up
            your creator profile to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BecomeCreatorForm />
        </CardContent>
      </Card>
    </div>
  );
}
