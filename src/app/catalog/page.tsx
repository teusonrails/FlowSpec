import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Browse Automations - FlowSpec",
};

export default function CatalogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Automations</h1>
        <p className="text-muted-foreground">
          Discover production-ready AI automation workflows
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        {/* Filter Sidebar */}
        <aside className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
                  placeholder="Search..."
                  readOnly
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">Domain</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Finance, Sales, Marketing...</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">Complexity</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Basic, Intermediate, Advanced</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-2">Platform</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Make.com, Zapier, n8n...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing automations
            </p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
