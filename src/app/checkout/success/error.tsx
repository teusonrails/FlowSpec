"use client";

import { GenericError } from "@/components/shared/generic-error";

export default function SuccessError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <GenericError
      error={error}
      reset={reset}
      homeHref="/dashboard/purchases"
      homeLabel="View Purchases"
    />
  );
}
