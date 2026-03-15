import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Eye,
  Clock,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "@/components/shared/rating-stars";
import { ComplexityBadge } from "@/components/shared/complexity-badge";
import { DomainBadge } from "@/components/shared/domain-badge";
import { PriceBadge } from "@/components/shared/price-badge";
import { getAutomationBySlug } from "@/lib/data/automations";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPurchased } from "@/lib/data/purchases";
import { hasReviewed } from "@/lib/data/reviews";
import { ReviewForm } from "@/components/catalog/review-form";
import { formatPrice, formatDate, formatNumber } from "@/lib/utils/format";
import { TIER_CONFIG } from "@/lib/utils/constants";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const automation = await getAutomationBySlug(slug);
  if (!automation) return { title: "Not Found - FlowSpec" };

  return {
    title: `${automation.name} - FlowSpec`,
    description: automation.description,
  };
}

export default async function AutomationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const automation = await getAutomationBySlug(slug);

  if (!automation) notFound();

  const user = await getCurrentUser();
  const canReview =
    user &&
    (await hasPurchased(user.id, automation.id)) &&
    !(await hasReviewed(user.id, automation.id));

  const creatorInitials = automation.creator.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/catalog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to catalog
        </Link>
      </Button>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <DomainBadge domain={automation.domain} />
              <ComplexityBadge complexity={automation.complexity} />
              <Badge variant="outline" className="text-xs">
                {TIER_CONFIG[automation.tier].label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                v{automation.version}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{automation.name}</h1>
            <p className="text-lg text-muted-foreground">
              {automation.description}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <RatingStars
                rating={automation.avgRating}
                count={automation.reviewCount}
                size="md"
              />
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {formatNumber(automation.totalSales)} sales
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatNumber(automation.viewCount)} views
              </span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {automation.longDescription && (
            <Card>
              <CardHeader>
                <CardTitle>About this automation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
                  {automation.longDescription}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platforms & Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {automation.platforms.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Platforms</p>
                  <div className="flex flex-wrap gap-2">
                    {automation.platforms.map(({ platform }) => (
                      <Badge key={platform.id} variant="secondary">
                        {platform.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {automation.tools.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {automation.tools.map(({ tool }) => (
                      <Badge key={tool.id} variant="secondary">
                        {tool.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {automation.aiModels.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">AI Models</p>
                  <div className="flex flex-wrap gap-2">
                    {automation.aiModels.map(({ aiModel }) => (
                      <Badge key={aiModel.id} variant="secondary">
                        {aiModel.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {automation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {automation.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  <Tag className="mr-1 h-3 w-3" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>
                Reviews ({automation.reviewCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canReview && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Write a Review</h3>
                  <ReviewForm automationId={automation.id} />
                  <Separator className="mt-6" />
                </div>
              )}
              {automation.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {automation.reviews.map((review) => {
                    const reviewInitials =
                      review.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) ?? "?";
                    return (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {reviewInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {review.user.name ?? "Anonymous"}
                            </p>
                            <div className="flex items-center gap-2">
                              <RatingStars rating={review.rating} />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <p className="text-sm font-medium">{review.title}</p>
                        )}
                        {review.body && (
                          <p className="text-sm text-muted-foreground">
                            {review.body}
                          </p>
                        )}
                        <Separator />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing Card */}
          <Card className="sticky top-20">
            <CardContent className="pt-6 space-y-4">
              <PriceBadge
                priceStarter={automation.priceStarter}
                pricePro={automation.pricePro}
                priceAgency={automation.priceAgency}
              />

              {/* Pricing tiers */}
              <div className="space-y-2">
                {automation.priceStarter !== null && (
                  <div className="flex justify-between text-sm">
                    <span>Starter</span>
                    <span className="font-medium">
                      {formatPrice(automation.priceStarter)}
                    </span>
                  </div>
                )}
                {automation.pricePro !== null && (
                  <div className="flex justify-between text-sm">
                    <span>Pro</span>
                    <span className="font-medium">
                      {formatPrice(automation.pricePro)}
                    </span>
                  </div>
                )}
                {automation.priceAgency !== null && (
                  <div className="flex justify-between text-sm">
                    <span>Agency</span>
                    <span className="font-medium">
                      {formatPrice(automation.priceAgency)}
                    </span>
                  </div>
                )}
                {automation.tier === "FREE" && (
                  <p className="text-sm text-muted-foreground">
                    This automation is free to download.
                  </p>
                )}
              </div>

              <Button className="w-full" size="lg">
                {automation.tier === "FREE" ? "Download Free" : "Purchase"}
              </Button>

              <Separator />

              {/* Metadata */}
              <div className="space-y-2 text-sm">
                {automation.setupTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Setup time
                    </span>
                    <span>{automation.setupTime} min</span>
                  </div>
                )}
                {automation.successRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Success rate
                    </span>
                    <span>{automation.successRate}%</span>
                  </div>
                )}
                {automation.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span>{formatDate(automation.publishedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Creator Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/creators/${automation.creator.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{creatorInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {automation.creator.displayName}
                    {automation.creator.isVerified && (
                      <ShieldCheck className="inline ml-1 h-3.5 w-3.5 text-primary" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {automation.creator._count.automations} automations
                  </p>
                </div>
              </Link>
              {automation.creator.bio && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                  {automation.creator.bio}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
