"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface StripeConnectCardProps {
  stripeAccountId: string | null;
}

interface AccountStatus {
  connected: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}

export function StripeConnectCard({
  stripeAccountId,
}: StripeConnectCardProps) {
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stripeAccountId) {
      fetch("/api/connect/status")
        .then((r) => r.json())
        .then(setStatus)
        .catch(() => setStatus({ connected: false }));
    } else {
      setStatus({ connected: false });
    }
  }, [stripeAccountId]);

  async function handleOnboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to start onboarding");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDashboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/connect/dashboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to open dashboard");
        return;
      }
      window.open(data.url, "_blank");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Loading Stripe status...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Not connected
  if (!status.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set Up Payouts</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive earnings from automation
            sales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOnboard} disabled={loading}>
            {loading ? "Redirecting..." : "Connect with Stripe"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connected but onboarding incomplete
  if (!status.detailsSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete Stripe Setup</CardTitle>
          <CardDescription>
            You started connecting your account but didn&apos;t finish.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOnboard} disabled={loading}>
            {loading ? "Redirecting..." : "Complete Setup"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Fully connected
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Stripe Connected</CardTitle>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
            Active
          </Badge>
        </div>
        <CardDescription>
          Payouts are sent automatically to your connected account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={handleDashboard} disabled={loading}>
          <ExternalLink className="mr-2 h-4 w-4" />
          {loading ? "Opening..." : "View Stripe Dashboard"}
        </Button>
      </CardContent>
    </Card>
  );
}
