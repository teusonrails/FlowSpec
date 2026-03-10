import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

const sortOptions = ["newest", "popular", "rating", "price_asc", "price_desc"] as const;

export const catalogSearchParams = {
  q: parseAsString.withDefault(""),
  domain: parseAsArrayOf(parseAsString).withDefault([]),
  platform: parseAsArrayOf(parseAsString).withDefault([]),
  complexity: parseAsArrayOf(parseAsString).withDefault([]),
  tool: parseAsArrayOf(parseAsString).withDefault([]),
  sort: parseAsStringLiteral(sortOptions).withDefault("newest"),
  page: parseAsInteger.withDefault(1),
};

export const catalogSearchParamsCache = createSearchParamsCache(catalogSearchParams);
