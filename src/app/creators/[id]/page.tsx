import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, BadgeCheck, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCreatorPublicProfile } from "@/lib/data/creators";
import { AutomationGrid } from "@/components/catalog/automation-grid";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const creator = await getCreatorPublicProfile(id);
  if (!creator) return { title: "Creator Not Found - FlowSpec" };
  return {
    title: `${creator.displayName} - FlowSpec`,
    description: creator.bio || `Check out ${creator.displayName}'s automations on FlowSpec`,
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const creator = await getCreatorPublicProfile(id);

  if (!creator) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/creators">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Creators
        </Link>
      </Button>

      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* Profile sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto overflow-hidden">
                {creator.user.avatarUrl ? (
                  <img
                    src={creator.user.avatarUrl}
                    alt={creator.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {creator.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h1 className="text-xl font-bold">{creator.displayName}</h1>
                  {creator.isVerified && (
                    <BadgeCheck className="h-5 w-5 text-primary" />
                  )}
                </div>
                {creator.user.name && creator.user.name !== creator.displayName && (
                  <p className="text-sm text-muted-foreground">
                    {creator.user.name}
                  </p>
                )}
              </div>

              {creator.bio && (
                <p className="text-sm text-muted-foreground">{creator.bio}</p>
              )}

              <Separator />

              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  {creator._count.automations} published automation
                  {creator._count.automations !== 1 ? "s" : ""}
                </p>
                <p>Member since {formatDate(creator.createdAt)}</p>
              </div>

              {(creator.website || creator.githubUrl || creator.twitterUrl) && (
                <>
                  <Separator />
                  <div className="flex justify-center gap-3">
                    {creator.website && (
                      <a
                        href={creator.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                    {creator.githubUrl && (
                      <a
                        href={creator.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    {creator.twitterUrl && (
                      <a
                        href={creator.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Automations */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Published Automations ({creator._count.automations})
          </h2>

          {creator.automations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No published automations yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <AutomationGrid automations={creator.automations} />
          )}
        </div>
      </div>
    </div>
  );
}
