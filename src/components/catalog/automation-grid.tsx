import { AutomationCard } from "@/components/shared/automation-card";
import type { AutomationCard as AutomationCardType } from "@/lib/types/database";

interface AutomationGridProps {
  automations: AutomationCardType[];
}

export function AutomationGrid({ automations }: AutomationGridProps) {
  if (automations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No automations found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {automations.map((automation) => (
        <AutomationCard key={automation.id} automation={automation} />
      ))}
    </div>
  );
}
