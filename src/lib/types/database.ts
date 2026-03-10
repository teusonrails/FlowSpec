import type {
  Automation,
  CreatorProfile,
  Platform,
  Tool,
  AiModel,
  Tag,
  Review,
  User,
  Purchase,
} from "@/generated/prisma";

// Automation card displayed in browse grid
export type AutomationCard = Pick<
  Automation,
  | "id"
  | "slug"
  | "name"
  | "description"
  | "domain"
  | "complexity"
  | "tier"
  | "priceStarter"
  | "pricePro"
  | "priceAgency"
  | "avgRating"
  | "reviewCount"
  | "totalSales"
> & {
  creator: Pick<CreatorProfile, "id" | "displayName"> & {
    user: Pick<User, "avatarUrl">;
  };
  platforms: { platform: Pick<Platform, "name" | "slug" | "iconUrl"> }[];
};

// Full automation detail page
export type AutomationDetail = Automation & {
  creator: CreatorProfile & {
    user: Pick<User, "avatarUrl" | "name">;
    _count: { automations: number };
  };
  platforms: { platform: Platform }[];
  tools: { tool: Tool }[];
  aiModels: { aiModel: AiModel }[];
  tags: { tag: Tag }[];
  reviews: (Review & {
    user: Pick<User, "name" | "avatarUrl">;
  })[];
};

// Creator public profile
export type CreatorPublicProfile = CreatorProfile & {
  user: Pick<User, "name" | "avatarUrl">;
  automations: AutomationCard[];
  _count: { automations: number };
};

// Purchase with automation info
export type PurchaseWithAutomation = Purchase & {
  automation: Pick<
    Automation,
    "id" | "slug" | "name" | "description" | "version"
  >;
};

// Review with user info
export type ReviewWithUser = Review & {
  user: Pick<User, "name" | "avatarUrl">;
};
