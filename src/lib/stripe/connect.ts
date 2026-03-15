import "server-only";
import { stripe } from "./client";
import { prisma } from "@/lib/prisma/client";

export interface ConnectAccountStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

/** Create a Stripe Connect Express account for a creator */
export async function createConnectAccount(
  creatorProfileId: string,
  userId: string,
  email: string
): Promise<string> {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    metadata: { creatorId: creatorProfileId, userId },
    capabilities: {
      transfers: { requested: true },
    },
  });

  await prisma.creatorProfile.update({
    where: { id: creatorProfileId },
    data: { stripeAccountId: account.id },
  });

  return account.id;
}

/** Create an account link for Stripe onboarding */
export async function createAccountLink(
  stripeAccountId: string
): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const link = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${appUrl}/dashboard/creator/payouts?refresh=true`,
    return_url: `${appUrl}/dashboard/creator/payouts?connected=true`,
    type: "account_onboarding",
  });

  return link.url;
}

/** Get account status */
export async function getAccountStatus(
  stripeAccountId: string
): Promise<ConnectAccountStatus> {
  const account = await stripe.accounts.retrieve(stripeAccountId);

  return {
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
  };
}

/** Create a login link to the Stripe Express dashboard */
export async function createLoginLink(
  stripeAccountId: string
): Promise<string> {
  const link = await stripe.accounts.createLoginLink(stripeAccountId);
  return link.url;
}
