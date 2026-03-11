import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function CreatorProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-6" />

      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        <Card>
          <CardContent className="pt-6 space-y-4 text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto" />
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Separator />
            <Skeleton className="h-4 w-24 mx-auto" />
          </CardContent>
        </Card>

        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
