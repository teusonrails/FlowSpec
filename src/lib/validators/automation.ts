import { z } from "zod/v4";

export const createAutomationSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(200),
  longDescription: z.string().max(5000).optional(),
  domain: z.enum([
    "FINANCE", "SALES", "SUPPORT", "MARKETING", "OPERATIONS",
    "HR", "LEGAL", "ECOMMERCE", "REAL_ESTATE", "HEALTHCARE",
    "EDUCATION", "LOGISTICS", "DEVOPS", "DATA", "GENERAL",
  ]),
  complexity: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED"]),
  tier: z.enum(["FREE", "OPEN", "CURATED"]),
  setupTime: z.number().int().positive().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default("1.0.0"),
  priceStarter: z.number().int().min(0).optional(),
  pricePro: z.number().int().min(0).optional(),
  priceAgency: z.number().int().min(0).optional(),
  platformIds: z.array(z.string().uuid()).min(1),
  toolIds: z.array(z.string().uuid()).optional(),
  aiModelIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  flowspecContent: z.string().optional(),
  packageUrl: z.string().url().optional(),
});

export const updateAutomationSchema = createAutomationSchema.partial();

export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;
export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>;
