import { Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your FlowSpec account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm message={message} />
      </CardContent>
    </Card>
  );
}
