import { useRef } from 'react';

import { toast } from 'sonner';

import { useUser } from '@/contexts/user-context';
import { useComments } from '@/contexts/comments-context';
import { likeComment, unlikeComment, type Comment } from '@/lib/api/comments';
import { RateLimitError } from '@/lib/api/errors';

// Like state lives in CommentsContext so every row showing this comment stays in sync.
// likedByMe arrives with the server-rendered comments, so there's no fetch-on-mount like useVideoLike.
export function useCommentLike(comment: Comment) {
  const { isAuthenticated } = useUser();
  const { setCommentLikeStatus } = useComments();
  const isPendingRef = useRef(false);

  const toggleLike = async () => {
    if (isPendingRef.current) return;

    if (!isAuthenticated) {
      toast.error('Log in to like', {
        position: 'top-center',
      });
      return;
    }

    const wasLiked = comment.likedByMe;
    const previousCount = comment.likeCount;

    // Optimistic update
    setCommentLikeStatus(
      comment.id,
      previousCount + (wasLiked ? -1 : 1),
      !wasLiked,
    );

    isPendingRef.current = true;
    try {
      const status = wasLiked
        ? await unlikeComment(comment.id)
        : await likeComment(comment.id);
      setCommentLikeStatus(comment.id, status.likeCount, status.likedByMe);
    } catch (e) {
      setCommentLikeStatus(comment.id, previousCount, wasLiked);

      if (e instanceof RateLimitError) {
        toast.error('Rate limit exceeded. Please try again later.', {
          position: 'top-center',
        });
      } else {
        console.error('Error updating comment like:', e);
        toast.error('Failed to update like. Please try again.', {
          position: 'top-center',
        });
      }
    } finally {
      isPendingRef.current = false;
    }
  };

  return {
    likeCount: comment.likeCount,
    likedByMe: comment.likedByMe,
    toggleLike,
  };
}
