import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuccessLoading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-10 w-48 mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
