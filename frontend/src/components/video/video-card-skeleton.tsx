import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function VideoCardSkeleton() {
  return (
    <Card className="flex flex-col gap-2">
      <Skeleton className="aspect-video" />

      <div className="flex flex-col gap-1 p-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
}
