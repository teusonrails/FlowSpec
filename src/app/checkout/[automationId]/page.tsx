import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils/format";
import { TIER_CONFIG } from "@/lib/utils/constants";
import { CheckoutButton } from "@/components/checkout/checkout-button";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ automationId: string }>;
  searchParams: Promise<{ tier?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { automationId } = await params;
  const automation = await prisma.automation.findUnique({
    where: { id: automationId },
    select: { name: true },
  });
  return {
    title: automation
      ? `Checkout — ${automation.name}`
      : "Checkout",
    robots: { index: false },
  };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: PageProps) {
  const { automationId } = await params;
  const { tier: tierParam } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/checkout/${automationId}`);

  const automation = await prisma.automation.findUnique({
    where: { id: automationId, status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      tier: true,
      priceStarter: true,
      pricePro: true,
      priceAgency: true,
      creator: { select: { displayName: true } },
    },
  });

  if (!automation) notFound();

  // Check if already purchased
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      buyerId_automationId: { buyerId: user.id, automationId },
    },
    select: { status: true },
  });

  if (existingPurchase?.status === "COMPLETED") {
    redirect(`/catalog/${automation.slug}`);
  }

  const selectedTier = tierParam?.toUpperCase() || "PRO";
  const tierPrices: Record<string, number | null> = {
    STARTER: automation.priceStarter,
    PRO: automation.pricePro,
    AGENCY: automation.priceAgency,
  };
  const price = tierPrices[selectedTier] ?? tierPrices.PRO ?? tierPrices.STARTER;
  const activeTier = price === tierPrices[selectedTier] ? selectedTier :
    tierPrices.PRO ? "PRO" : "STARTER";

  if (!price || price <= 0) {
    redirect(`/catalog/${automation.slug}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href={`/catalog/${automation.slug}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to automation
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{automation.name}</h3>
            <p className="text-sm text-muted-foreground">
              by {automation.creator.displayName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {automation.description}
            </p>
          </div>

          <Separator />

          {/* Tier selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Select Tier</p>
            <div className="flex gap-2">
              {(["STARTER", "PRO", "AGENCY"] as const).map((t) => {
                const p = tierPrices[t];
                if (!p || p <= 0) return null;
                return (
                  <Link
                    key={t}
                    href={`/checkout/${automationId}?tier=${t.toLowerCase()}`}
                  >
                    <Badge
                      variant={activeTier === t ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5"
                    >
                      {t} — {formatPrice(p)}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(price)}</span>
          </div>

          <CheckoutButton
            automationId={automation.id}
            tier={activeTier}
            price={price}
          />

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Secure payment powered by Stripe
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
