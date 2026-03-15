"use client";

import { GenericError } from "@/components/shared/generic-error";

export default function CreatorError({
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
      homeHref="/creators"
      homeLabel="All Creators"
    />
  );
}
