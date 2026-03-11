import { Suspense } from "react";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Card, CardContent } from "@/components/ui/card";
import { catalogSearchParamsCache } from "@/lib/catalog/search-params";
import { browseAutomations } from "@/lib/data/automations";
import { CatalogSearch } from "@/components/catalog/catalog-search";
import { CatalogSort } from "@/components/catalog/catalog-sort";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";

export const dynamic = "force-dynamic";
import { MobileFilters } from "@/components/catalog/mobile-filters";
import { ActiveFilters } from "@/components/catalog/active-filters";
import { AutomationGrid } from "@/components/catalog/automation-grid";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import type { Domain, Complexity } from "@/generated/prisma";

export const metadata: Metadata = {
  title: "Browse Automations - FlowSpec",
  description: "Discover production-ready AI automation workflows",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const parsed = catalogSearchParamsCache.parse(await searchParams);

  const data = await browseAutomations({
    q: parsed.q || undefined,
    domain: parsed.domain.length ? (parsed.domain as Domain[]) : undefined,
    complexity: parsed.complexity.length
      ? (parsed.complexity as Complexity[])
      : undefined,
    platform: parsed.platform.length ? parsed.platform : undefined,
    tool: parsed.tool.length ? parsed.tool : undefined,
    sort: parsed.sort,
    page: parsed.page,
  });

  return (
    <NuqsAdapter>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Browse Automations</h1>
          <p className="text-muted-foreground">
            Discover production-ready AI automation workflows
          </p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block">
            <Card>
              <CardContent className="pt-6">
                <FilterSidebar filters={data.filters} />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Search + Sort + Mobile Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <CatalogSearch />
              </div>
              <div className="flex gap-2">
                <MobileFilters filters={data.filters} />
                <CatalogSort />
              </div>
            </div>

            {/* Active Filters */}
            <ActiveFilters />

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              {data.pagination.total === 0
                ? "No results"
                : `Showing ${(data.pagination.page - 1) * data.pagination.limit + 1}–${Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of ${data.pagination.total} automations`}
            </p>

            {/* Grid */}
            <Suspense fallback={<CatalogGridSkeleton />}>
              <AutomationGrid automations={data.automations} />
            </Suspense>

            {/* Pagination */}
            <CatalogPagination pagination={data.pagination} />
          </div>
        </div>
      </div>
    </NuqsAdapter>
  );
}

function CatalogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6 space-y-3">
            <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded bg-muted animate-pulse" />
              <div className="h-5 w-20 rounded bg-muted animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
