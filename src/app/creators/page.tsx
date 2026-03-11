import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma/client";
import { BadgeCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Creators - FlowSpec",
  description: "Meet the automation experts building on FlowSpec",
};

async function getCreators() {
  return prisma.creatorProfile.findMany({
    where: {
      automations: { some: { status: "PUBLISHED" } },
    },
    select: {
      id: true,
      displayName: true,
      bio: true,
      isVerified: true,
      user: {
        select: { avatarUrl: true },
      },
      _count: {
        select: { automations: { where: { status: "PUBLISHED" } } },
      },
    },
    orderBy: { automations: { _count: "desc" } },
  });
}

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creators</h1>
        <p className="text-muted-foreground">
          Meet the automation experts building on FlowSpec
        </p>
      </div>

      {creators.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No creators yet. Be the first to publish an automation!
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <Link key={creator.id} href={`/creators/${creator.id}`}>
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {creator.user.avatarUrl ? (
                        <img
                          src={creator.user.avatarUrl}
                          alt={creator.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-muted-foreground">
                          {creator.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold truncate">
                          {creator.displayName}
                        </h3>
                        {creator.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      {creator.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {creator.bio}
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-2">
                        {creator._count.automations} automation
                        {creator._count.automations !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
