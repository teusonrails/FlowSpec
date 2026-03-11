import Link from "next/link";
import { Download } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RatingStars } from "./rating-stars";
import { PriceBadge } from "./price-badge";
import { ComplexityBadge } from "./complexity-badge";
import { DomainBadge } from "./domain-badge";
import type { AutomationCard as AutomationCardType } from "@/lib/types/database";
import { formatNumber } from "@/lib/utils/format";

interface AutomationCardProps {
  automation: AutomationCardType;
}

export function AutomationCard({ automation }: AutomationCardProps) {
  return (
    <Link href={`/catalog/${automation.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2 text-sm leading-tight">
              {automation.name}
            </h3>
            <PriceBadge
              priceStarter={automation.priceStarter}
              pricePro={automation.pricePro}
              priceAgency={automation.priceAgency}
            />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {automation.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <DomainBadge domain={automation.domain} />
            <ComplexityBadge complexity={automation.complexity} />
          </div>
          {automation.platforms.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {automation.platforms.map((p) => p.platform.name).join(", ")}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground justify-between">
          <RatingStars
            rating={automation.avgRating}
            count={automation.reviewCount}
          />
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {formatNumber(automation.totalSales)}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
