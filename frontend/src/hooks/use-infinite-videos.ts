import { useCallback, useState, useRef, useEffect } from 'react';

import { getVideos, type VideoSummaryResponse } from '@/lib/api/videos';

const PAGE_SIZE = 12;

export function useInfiniteVideos(pageSize?: number, excludeVideoId?: string) {
  const [videos, setVideos] = useState<VideoSummaryResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await getVideos(
        page,
        pageSize ?? PAGE_SIZE,
        excludeVideoId,
      );

      setVideos((prev) => [...prev, ...response.content]);
      setHasMore(page + 1 < response.page.totalPages);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to fetch videos');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [page, hasMore, pageSize, excludeVideoId]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    loadMore();
  }, [loadMore]);

  return { videos, loadMore, hasMore, isLoading, error };
}
