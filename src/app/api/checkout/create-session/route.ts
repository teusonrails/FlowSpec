import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { checkoutSchema } from "@/lib/validators/checkout";
import { COMMISSION_RATES } from "@/lib/utils/constants";
import { TIER_CONFIG } from "@/lib/utils/constants";
import type { AutomationTier } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { automationId, tier } = parsed.data;

    const automation = await prisma.automation.findUnique({
      where: { id: automationId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        tier: true,
        status: true,
        priceStarter: true,
        pricePro: true,
        priceAgency: true,
        creatorId: true,
        creator: {
          select: { stripeAccountId: true },
        },
      },
    });

    if (!automation || automation.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 }
      );
    }

    // Determine price based on tier
    const priceMap: Record<string, number | null> = {
      STARTER: automation.priceStarter,
      PRO: automation.pricePro,
      AGENCY: automation.priceAgency,
    };
    const price = priceMap[tier];

    if (price === null || price === undefined || price <= 0) {
      return NextResponse.json(
        { error: `${tier} tier is not available for this automation` },
        { status: 400 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        buyerId_automationId: { buyerId: user.id, automationId },
      },
      select: { id: true, status: true },
    });

    if (existingPurchase?.status === "COMPLETED") {
      return NextResponse.json(
        { error: "You have already purchased this automation" },
        { status: 400 }
      );
    }

    // Calculate commission
    const commissionRate =
      COMMISSION_RATES[automation.tier as AutomationTier] ?? 0.25;
    const applicationFee = Math.round(price * commissionRate);

    const creatorStripeAccountId = automation.creator.stripeAccountId;

    // Create Stripe Checkout Session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: automation.name,
              description: `${tier} tier — ${automation.description}`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        automationId: automation.id,
        buyerId: user.id,
        tier,
        creatorId: automation.creatorId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/catalog/${automation.slug}`,
      customer_email: user.email,
    };

    // Add destination charge if creator has Stripe Connect
    if (creatorStripeAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: creatorStripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("POST /api/checkout/create-session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
