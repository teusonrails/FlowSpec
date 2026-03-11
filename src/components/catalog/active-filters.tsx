"use client";

import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs";
import { useTransition } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DOMAIN_CONFIG, COMPLEXITY_CONFIG } from "@/lib/utils/constants";
import type { Domain, Complexity } from "@/generated/prisma";

const allLabels: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(DOMAIN_CONFIG).map(([k, v]) => [k, v.label])
  ),
  ...Object.fromEntries(
    Object.entries(COMPLEXITY_CONFIG).map(([k, v]) => [k, v.label])
  ),
};

export function ActiveFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      domain: parseAsArrayOf(parseAsString).withDefault([]),
      complexity: parseAsArrayOf(parseAsString).withDefault([]),
      platform: parseAsArrayOf(parseAsString).withDefault([]),
      tool: parseAsArrayOf(parseAsString).withDefault([]),
    },
    { shallow: false }
  );
  const [, startTransition] = useTransition();

  const allActive = [
    ...filters.domain.map((v) => ({ key: "domain" as const, value: v })),
    ...filters.complexity.map((v) => ({ key: "complexity" as const, value: v })),
    ...filters.platform.map((v) => ({ key: "platform" as const, value: v })),
    ...filters.tool.map((v) => ({ key: "tool" as const, value: v })),
  ];

  if (allActive.length === 0) return null;

  function remove(key: keyof typeof filters, value: string) {
    startTransition(() => {
      const next = filters[key].filter((v) => v !== value);
      setFilters({ [key]: next.length ? next : null });
    });
  }

  function clearAll() {
    startTransition(() => {
      setFilters({
        domain: null,
        complexity: null,
        platform: null,
        tool: null,
      });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allActive.map(({ key, value }) => (
        <Badge
          key={`${key}-${value}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {allLabels[value] ?? value}
          <button
            onClick={() => remove(key, value)}
            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="xs"
        onClick={clearAll}
        className="text-muted-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}
