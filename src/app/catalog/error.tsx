"use client";

import { Button } from "@/components/ui/button";

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "Failed to load automations. Please try again."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
