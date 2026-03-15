import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminSubmissions } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils/format";
import { DOMAIN_CONFIG } from "@/lib/utils/constants";
import { AdminSubmissionActions } from "@/components/dashboard/admin-submission-actions";
import type { Domain, AutomationStatus } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Submissions - FlowSpec Admin",
};

const statusColors: Record<AutomationStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500",
  VALIDATED: "bg-blue-500/10 text-blue-500",
  PUBLISHED: "bg-green-500/10 text-green-500",
  REJECTED: "bg-red-500/10 text-red-500",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default async function AdminSubmissionsPage() {
  await requireAdmin();
  const { submissions, pagination } = await getAdminSubmissions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Submissions</h1>
      <p className="text-muted-foreground">
        Review and manage automation submissions ({pagination.total} total)
      </p>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No pending submissions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{submission.name}</h3>
                      <Badge
                        className={statusColors[submission.status]}
                        variant="secondary"
                      >
                        {submission.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {submission.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>
                        {DOMAIN_CONFIG[submission.domain as Domain]?.label ?? submission.domain}
                      </span>
                      <span>by {submission.creator.displayName}</span>
                      {submission.creator.isVerified && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      )}
                      {submission.validationScore !== null && (
                        <span>Score: {submission.validationScore}%</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {formatDate(submission.createdAt)}
                    </p>
                  </div>
                  <AdminSubmissionActions
                    automationId={submission.id}
                    currentStatus={submission.status}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
