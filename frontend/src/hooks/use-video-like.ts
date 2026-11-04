import { useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { useUser } from '@/contexts/user-context';
import { getLikeStatus, likeVideo, unlikeVideo } from '@/lib/api/videos';
import { RateLimitError } from '@/lib/api/errors';

export function useVideoLike(videoId: string, initialLikeCount: number) {
  const { user, isLoading: isUserLoading, isAuthenticated } = useUser();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likedByMe, setLikedByMe] = useState(false);
  const isPendingRef = useRef(false);

  // likedByMe can't be server rendered (RSC fetch has no session), so fetch it once the user is known
  useEffect(() => {
    if (isUserLoading) return;

    const controller = new AbortController();

    getLikeStatus(videoId, controller.signal)
      .then((status) => {
        setLikeCount(status.likeCount);
        setLikedByMe(status.likedByMe);
      })
      .catch((e) => {
        if (e instanceof Error && e.name === 'AbortError') return; // Abort is cleanup, not an error
        console.error('Error fetching like status:', e);
      });

    return () => controller.abort();
  }, [videoId, user?.id, isUserLoading]);

  const toggleLike = async () => {
    if (isPendingRef.current) return;

    if (!isAuthenticated) {
      toast.error('Log in to like', {
        position: 'top-center',
      });
      return;
    }

    const wasLiked = likedByMe;
    const previousCount = likeCount;

    // Optimistic update
    setLikedByMe(!wasLiked);
    setLikeCount(previousCount + (wasLiked ? -1 : 1));

    isPendingRef.current = true;
    try {
      const status = wasLiked
        ? await unlikeVideo(videoId)
        : await likeVideo(videoId);
      setLikeCount(status.likeCount);
      setLikedByMe(status.likedByMe);
    } catch (e) {
      setLikedByMe(wasLiked);
      setLikeCount(previousCount);

      if (e instanceof RateLimitError) {
        toast.error('Rate limit exceeded. Please try again later.', {
          position: 'top-center',
        });
      } else {
        console.error('Error updating like:', e);
        toast.error('Failed to update like. Please try again.', {
          position: 'top-center',
        });
      }
    } finally {
      isPendingRef.current = false;
    }
  };

  return { likeCount, likedByMe, toggleLike };
}
