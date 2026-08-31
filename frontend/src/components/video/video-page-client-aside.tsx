import { useEffect, useRef } from 'react';

import { useComments } from '@/contexts/comments-context';
import { useInfiniteVideos } from '@/hooks/use-infinite-videos';

import TimestampCommentSidebar from '../comment/timestamp-comment-sidebar';
import { VideoCard } from './video-card';
import { VideoCardSkeleton } from './video-card-skeleton';

const PAGE_SIZE = 5;

type VideoPageClientAsideProps = {
  videoId: string;
};

export default function VideoPageClientAside({
  videoId,
}: VideoPageClientAsideProps) {
  const { isSidebarOpen } = useComments();
  const { videos, loadMore, hasMore, isLoading, error } = useInfiniteVideos(
    PAGE_SIZE,
    videoId,
  );

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
    <aside className='mb-4'>
      {isSidebarOpen && (
        <div className='mb-2'>
          <TimestampCommentSidebar />
        </div>
      )}

      {error && (
        <p className='text-sm text-destructive'>
          Failed to load videos. Try refreshing.
        </p>
      )}

      {!error && videos.length > 0 && (
        <div className='hidden sm:flex flex-col gap-4'>
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      {!error && isLoading && videos.length > 0 && (
        <div className='hidden sm:flex flex-col gap-4 mt-4'>
          <VideoCardSkeleton />
        </div>
      )}

      {!error && hasMore && <div ref={sentinelRef} className='h-1' />}

      {!error && videos.length === 0 && isLoading && (
        <div className='hidden sm:flex flex-col gap-4'>
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
    </aside>
  );
}
