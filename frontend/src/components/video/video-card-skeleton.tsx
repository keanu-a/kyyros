import { Skeleton } from '../ui/skeleton';

export default function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-video" />

      <div className="flex items-center">
        <Skeleton className="rounded-full h-10 w-10" />
        <div className="flex flex-col gap-1 p-2 w-full">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
