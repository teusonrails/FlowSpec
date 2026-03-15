"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { adminUpdateStatus } from "@/lib/actions/automation";
import { toast } from "sonner";
import type { AutomationStatus } from "@/generated/prisma";

interface AdminSubmissionActionsProps {
  automationId: string;
  currentStatus: AutomationStatus;
}

export function AdminSubmissionActions({
  automationId,
  currentStatus,
}: AdminSubmissionActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleAction(status: AutomationStatus) {
    startTransition(async () => {
      const result = await adminUpdateStatus(automationId, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${status.replace("_", " ").toLowerCase()}`);
      }
    });
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {(currentStatus === "PENDING_REVIEW" || currentStatus === "VALIDATED") && (
        <>
          <Button
            size="sm"
            onClick={() => handleAction("PUBLISHED")}
            disabled={isPending}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction("REJECTED")}
            disabled={isPending}
          >
            Reject
          </Button>
        </>
      )}
      {currentStatus === "PUBLISHED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("ARCHIVED")}
          disabled={isPending}
        >
          Archive
        </Button>
      )}
      {currentStatus === "REJECTED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("PUBLISHED")}
          disabled={isPending}
        >
          Reinstate
        </Button>
      )}
    </div>
  );
}
