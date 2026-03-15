import { z } from "zod/v4";

export const checkoutSchema = z.object({
  automationId: z.string().uuid(),
  tier: z.enum(["STARTER", "PRO", "AGENCY"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
