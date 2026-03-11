"use client";

import { useQueryState } from "nuqs";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { catalogSearchParams } from "@/lib/catalog/search-params";
import type { PaginationMeta } from "@/lib/types/api";

interface CatalogPaginationProps {
  pagination: PaginationMeta;
}

export function CatalogPagination({ pagination }: CatalogPaginationProps) {
  const [, setPage] = useQueryState("page", {
    ...catalogSearchParams.page,
    shallow: false,
  });
  const [, startTransition] = useTransition();

  if (pagination.totalPages <= 1) return null;

  function goTo(p: number) {
    startTransition(() => {
      setPage(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const { page, totalPages } = pagination;

  // Show up to 5 page numbers around current page
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => goTo(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
