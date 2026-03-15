import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminUsers } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users - FlowSpec Admin",
};

const roleColors: Record<string, string> = {
  BUYER: "bg-muted text-muted-foreground",
  CREATOR: "bg-blue-500/10 text-blue-500",
  ADMIN: "bg-purple-500/10 text-purple-500",
};

export default async function AdminUsersPage() {
  await requireAdmin();
  const { users, pagination } = await getAdminUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-muted-foreground">
        {pagination.total} registered users
      </p>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {user.name ?? user.email}
                    </h3>
                    <Badge className={roleColors[user.role]} variant="secondary">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.creatorProfile && (
                    <p className="text-sm text-muted-foreground">
                      Creator: {user.creatorProfile.displayName}
                      {user.creatorProfile.isVerified && " (Verified)"}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{user._count.purchases} purchases</span>
                    <span>{user._count.reviews} reviews</span>
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
