import type { Domain, Complexity, AutomationTier } from "@/generated/prisma";

export const DOMAIN_CONFIG: Record<
  Domain,
  { label: string; color: string }
> = {
  FINANCE: { label: "Finance", color: "domain-finance" },
  SALES: { label: "Sales", color: "domain-sales" },
  SUPPORT: { label: "Support", color: "domain-support" },
  MARKETING: { label: "Marketing", color: "domain-marketing" },
  OPERATIONS: { label: "Operations", color: "domain-operations" },
  HR: { label: "HR", color: "domain-hr" },
  LEGAL: { label: "Legal", color: "domain-legal" },
  ECOMMERCE: { label: "E-Commerce", color: "domain-ecommerce" },
  REAL_ESTATE: { label: "Real Estate", color: "domain-real-estate" },
  HEALTHCARE: { label: "Healthcare", color: "domain-healthcare" },
  EDUCATION: { label: "Education", color: "domain-education" },
  LOGISTICS: { label: "Logistics", color: "domain-logistics" },
  DEVOPS: { label: "DevOps", color: "domain-devops" },
  DATA: { label: "Data", color: "domain-data" },
  GENERAL: { label: "General", color: "domain-general" },
};

export const COMPLEXITY_CONFIG: Record<
  Complexity,
  { label: string; color: string }
> = {
  BASIC: { label: "Basic", color: "complexity-basic" },
  INTERMEDIATE: { label: "Intermediate", color: "complexity-intermediate" },
  ADVANCED: { label: "Advanced", color: "complexity-advanced" },
};

export const TIER_CONFIG: Record<
  AutomationTier,
  { label: string; color: string }
> = {
  FREE: { label: "Free", color: "tier-free" },
  OPEN: { label: "Open", color: "tier-open" },
  CURATED: { label: "Curated", color: "tier-curated" },
};

// Commission rates for marketplace fee calculation
export const COMMISSION_RATES: Record<AutomationTier, number> = {
  FREE: 0,
  OPEN: 0.25,
  CURATED: 0.4,
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export const ITEMS_PER_PAGE = 20;
export const MAX_ITEMS_PER_PAGE = 50;
