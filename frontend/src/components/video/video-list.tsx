import { useEffect, useRef } from 'react';

import { VideoSummaryResponse } from '@/lib/api/videos';

import { VideoCard } from './video-card';
import { VideoCardSkeleton } from './video-card-skeleton';

const PAGE_SIZE = 5;

type VideoListProps = {
  videos: VideoSummaryResponse[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
};

export default function VideoList({
  videos,
  isLoading,
  hasMore,
  loadMore,
  error,
}: VideoListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [loadMore, hasMore]);

  return (
    <>
      {error && (
        <p className='text-sm text-destructive'>
          Failed to load videos. Try refreshing.
        </p>
      )}

      {!error && videos.length > 0 && (
        <div className='flex flex-col gap-4'>
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      {!error && isLoading && videos.length > 0 && (
        <div className='flex flex-col gap-4 mt-4'>
          <VideoCardSkeleton />
        </div>
      )}

      {!error && hasMore && <div ref={sentinelRef} className='h-1' />}

      {!error && videos.length === 0 && isLoading && (
        <div className='flex flex-col gap-4'>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!error && !hasMore && videos.length > 0 && (
        <p className='my-8 text-center text-sm text-muted-foreground'>
          You&apos;ve reached the end of the videos.
        </p>
      )}

      {!error && !hasMore && videos.length === 0 && !isLoading && (
        <p className='my-8 text-center text-sm text-muted-foreground'>
          No videos found.
        </p>
      )}
    </>
  );
}
