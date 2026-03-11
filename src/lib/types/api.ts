import type { Domain, Complexity, AutomationTier } from "@/generated/prisma";
import type { AutomationCard } from "./database";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BrowseParams {
  q?: string;
  domain?: Domain[];
  platform?: string[];
  complexity?: Complexity[];
  tool?: string[];
  aiModel?: string[];
  tier?: AutomationTier[];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sort?: "newest" | "popular" | "rating" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export interface FilterCount {
  value: string;
  count: number;
}

export interface BrowseResponse {
  automations: AutomationCard[];
  pagination: PaginationMeta;
  filters: {
    domains: FilterCount[];
    platforms: FilterCount[];
    complexities: FilterCount[];
    tools: FilterCount[];
  };
}

export interface ApiError {
  error: string;
  details?: unknown;
}
