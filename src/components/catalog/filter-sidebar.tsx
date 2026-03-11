import { FilterSection } from "./filter-section";
import { DOMAIN_CONFIG, COMPLEXITY_CONFIG } from "@/lib/utils/constants";
import type { BrowseResponse } from "@/lib/types/api";

interface FilterSidebarProps {
  filters: BrowseResponse["filters"];
}

const domainLabels = Object.fromEntries(
  Object.entries(DOMAIN_CONFIG).map(([key, val]) => [key, val.label])
);

const complexityLabels = Object.fromEntries(
  Object.entries(COMPLEXITY_CONFIG).map(([key, val]) => [key, val.label])
);

export function FilterSidebar({ filters }: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <FilterSection
        title="Domain"
        paramKey="domain"
        options={filters.domains}
        labels={domainLabels}
      />
      <FilterSection
        title="Complexity"
        paramKey="complexity"
        options={filters.complexities}
        labels={complexityLabels}
      />
      <FilterSection
        title="Platform"
        paramKey="platform"
        options={filters.platforms}
      />
      <FilterSection
        title="Tool"
        paramKey="tool"
        options={filters.tools}
      />
    </div>
  );
}
