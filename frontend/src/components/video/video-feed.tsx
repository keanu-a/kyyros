'use client';

import { useEffect, useRef } from 'react';

import { useInfiniteVideos } from '@/hooks/use-infinite-videos';
import { VideoCard } from './video-card';
import { VideoCardSkeleton } from './video-card-skeleton';

const SKELETON_COUNT = 12;

export default function VideoFeed() {
  const { videos, loadMore, hasMore, isLoading, error } = useInfiniteVideos();
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

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load videos. Try refreshing.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        )}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-1" />}

      {!hasMore && videos.length > 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          You&apos;ve reached the end of the videos.
        </p>
      )}

      {!hasMore && videos.length === 0 && !isLoading && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No videos found.
        </p>
      )}
    </div>
  );
}
