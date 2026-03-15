"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenericErrorProps {
  error: Error;
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
}

export function GenericError({
  error,
  reset,
  homeHref = "/",
  homeLabel = "Go home",
}: GenericErrorProps) {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex justify-center gap-3">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
