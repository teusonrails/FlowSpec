import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma/client";
import { COMMISSION_RATES } from "@/lib/utils/constants";
import type { AutomationTier, PurchaseTier } from "@/generated/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const {
          automationId,
          buyerId,
          tier,
          creatorId,
        } = session.metadata ?? {};

        if (!automationId || !buyerId || !tier) {
          console.error("Webhook missing metadata:", session.metadata);
          break;
        }

        // Idempotency: check if purchase already exists
        const existingPurchase = await prisma.purchase.findFirst({
          where: { stripeSessionId: session.id },
          select: { id: true },
        });

        if (existingPurchase) {
          // Already processed
          break;
        }

        const amountPaid = session.amount_total ?? 0;

        // Get automation tier for commission calculation
        const automation = await prisma.automation.findUnique({
          where: { id: automationId },
          select: { tier: true },
        });

        const commissionRate =
          COMMISSION_RATES[(automation?.tier as AutomationTier) ?? "OPEN"] ??
          0.25;
        const platformFee = Math.round(amountPaid * commissionRate);
        const creatorEarnings = amountPaid - platformFee;

        // Create Purchase record
        await prisma.purchase.create({
          data: {
            buyerId,
            automationId,
            tier: tier as PurchaseTier,
            amountPaid,
            platformFee,
            creatorEarnings,
            currency: session.currency || "usd",
            stripePaymentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            stripeSessionId: session.id,
            status: "COMPLETED",
          },
        });

        // Update automation stats
        await prisma.automation.update({
          where: { id: automationId },
          data: {
            totalSales: { increment: 1 },
            totalRevenue: { increment: amountPaid },
          },
        });

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : null;

        if (!paymentIntentId) break;

        const purchase = await prisma.purchase.findFirst({
          where: { stripePaymentId: paymentIntentId },
          select: { id: true, automationId: true, amountPaid: true },
        });

        if (!purchase) break;

        await prisma.$transaction([
          prisma.purchase.update({
            where: { id: purchase.id },
            data: { status: "REFUNDED" },
          }),
          prisma.automation.update({
            where: { id: purchase.automationId },
            data: {
              totalSales: { decrement: 1 },
              totalRevenue: { decrement: purchase.amountPaid },
            },
          }),
        ]);

        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Still return 200 to acknowledge receipt — Stripe will retry otherwise
  }

  return NextResponse.json({ received: true });
}
