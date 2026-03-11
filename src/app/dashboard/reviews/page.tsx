import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { getUserReviews } from "@/lib/data/reviews";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Reviews - FlowSpec",
};

export default async function ReviewsPage() {
  const user = await requireAuth();
  const reviews = await getUserReviews(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Reviews</h1>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t written any reviews yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/purchases">View Purchases</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/catalog/${review.automation.slug}`}
                      className="font-semibold hover:underline"
                    >
                      {review.automation.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      by {review.automation.creator.displayName}
                    </p>
                    <div className="flex items-center gap-0.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    {review.title && (
                      <p className="font-medium mt-2">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {review.body}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
