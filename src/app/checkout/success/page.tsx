import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Purchase Complete",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/catalog");

  let automationName = "your automation";
  let tier = "";
  let slug = "";
  let purchaseReady = false;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid" && session.metadata) {
      const { automationId } = session.metadata;
      tier = session.metadata.tier ?? "";

      if (automationId) {
        const automation = await prisma.automation.findUnique({
          where: { id: automationId },
          select: { name: true, slug: true },
        });
        if (automation) {
          automationName = automation.name;
          slug = automation.slug;
        }

        // Check if webhook has created the purchase yet
        const purchase = await prisma.purchase.findFirst({
          where: { stripeSessionId: session_id },
          select: { id: true },
        });
        purchaseReady = !!purchase;
      }
    }
  } catch {
    // If session retrieval fails, still show a generic success page
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Thank you for your purchase!</h1>
          <p className="text-muted-foreground">
            You&apos;ve purchased <strong>{automationName}</strong>
            {tier && <> ({tier} tier)</>}.
          </p>

          {!purchaseReady && (
            <p className="text-sm text-muted-foreground">
              Your purchase is being processed. It should appear in your
              purchases within a few moments.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild>
              <Link href="/dashboard/purchases">View My Purchases</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/catalog">Browse More Automations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
