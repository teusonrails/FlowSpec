import type { Complexity } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { COMPLEXITY_CONFIG } from "@/lib/utils/constants";

interface ComplexityBadgeProps {
  complexity: Complexity;
}

export function ComplexityBadge({ complexity }: ComplexityBadgeProps) {
  const config = COMPLEXITY_CONFIG[complexity];

  return (
    <Badge
      variant="outline"
      className="text-xs"
      style={{ borderColor: `var(--color-${config.color})`, color: `var(--color-${config.color})` }}
    >
      {config.label}
    </Badge>
  );
}
