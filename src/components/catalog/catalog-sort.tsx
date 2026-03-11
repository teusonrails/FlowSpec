"use client";

import { useQueryState } from "nuqs";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/utils/constants";
import { catalogSearchParams } from "@/lib/catalog/search-params";

export function CatalogSort() {
  const [sort, setSort] = useQueryState("sort", {
    ...catalogSearchParams.sort,
    shallow: false,
  });
  const [, startTransition] = useTransition();

  return (
    <Select
      value={sort}
      onValueChange={(value) => {
        startTransition(() => {
          setSort(value as typeof sort);
        });
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
