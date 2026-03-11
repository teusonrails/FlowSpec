import { Badge } from "@/components/ui/badge";
import { formatPrice, getLowestPrice } from "@/lib/utils/format";

interface PriceBadgeProps {
  priceStarter: number | null;
  pricePro: number | null;
  priceAgency: number | null;
}

export function PriceBadge({
  priceStarter,
  pricePro,
  priceAgency,
}: PriceBadgeProps) {
  const lowest = getLowestPrice(priceStarter, pricePro, priceAgency);
  const label = formatPrice(lowest);
  const isFree = !lowest || lowest === 0;

  return (
    <Badge variant={isFree ? "secondary" : "default"}>
      {isFree ? "Free" : `From ${label}`}
    </Badge>
  );
}
