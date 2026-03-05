import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VerifySkeleton() {
  return (
    <Card className="space-y-4">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-5 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[85%]" />
      </div>
      <Skeleton className="h-10 w-40" />
    </Card>
  );
}
