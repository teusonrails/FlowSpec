import type { Domain } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { DOMAIN_CONFIG } from "@/lib/utils/constants";

interface DomainBadgeProps {
  domain: Domain;
}

export function DomainBadge({ domain }: DomainBadgeProps) {
  const config = DOMAIN_CONFIG[domain];

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
