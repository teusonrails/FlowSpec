"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <h2 className="text-2xl font-bold mb-2">Checkout Error</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "Something went wrong during checkout."}
      </p>
      <div className="flex justify-center gap-3">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button asChild>
          <Link href="/catalog">Browse Automations</Link>
        </Button>
      </div>
    </div>
  );
}
