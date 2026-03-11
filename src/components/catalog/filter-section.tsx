"use client";

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { FilterCount } from "@/lib/types/api";

interface FilterSectionProps {
  title: string;
  paramKey: string;
  options: FilterCount[];
  labels?: Record<string, string>;
}

export function FilterSection({
  title,
  paramKey,
  options,
  labels,
}: FilterSectionProps) {
  const [selected, setSelected] = useQueryState(
    paramKey,
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({ shallow: false })
  );
  const [, startTransition] = useTransition();

  function toggle(value: string) {
    startTransition(() => {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      setSelected(next.length ? next : null);
    });
  }

  if (options.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <div className="space-y-1">
        {options.map((option) => {
          const isActive = selected.includes(option.value);
          const label = labels?.[option.value] ?? option.value;
          return (
            <button
              key={option.value}
              onClick={() => toggle(option.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="truncate">{label}</span>
              <span className="text-xs tabular-nums ml-2">{option.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
