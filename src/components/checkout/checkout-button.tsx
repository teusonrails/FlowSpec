"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { toast } from "sonner";

interface CheckoutButtonProps {
  automationId: string;
  tier: string;
  price: number;
}

export function CheckoutButton({
  automationId,
  tier,
  price,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ automationId, tier }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create checkout session");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Redirecting to Stripe..." : `Pay ${formatPrice(price)}`}
    </Button>
  );
}
