import { useState } from 'react';

import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { createReply } from '@/lib/api/comments';
import { NotFoundError, RateLimitError } from '@/lib/api/errors';
import { useComments } from '@/contexts/comments-context';

// Always posts to the thread's root, so replying still works if the reply being answered was deleted
export function usePostReply(rootCommentId: string) {
  const { handleAddReply, handleDeleteComment } = useComments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return false;

    // Check session since only signed in users can reply
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error('Log in to reply', {
        position: 'top-center',
      });
      setError('auth');
      return false;
    }

    setIsSubmitting(true);
    try {
      const newReply = await createReply(rootCommentId, {
        content: trimmedContent,
      });
      handleAddReply(rootCommentId, newReply);
      setError(null);
      return true;
    } catch (e) {
      if (e instanceof NotFoundError) {
        // The root was deleted by its author, so drop the stale thread
        toast.error('This comment was deleted.', {
          position: 'top-center',
        });
        handleDeleteComment(rootCommentId);
        setError('not-found');
      } else if (e instanceof RateLimitError) {
        toast.error('Rate limit exceeded. Please try again later.', {
          position: 'top-center',
        });
        setError('rate-limit');
      } else {
        console.error('Error posting reply:', e);
        toast.error('Failed to post reply. Please try again.', {
          position: 'top-center',
        });
        setError('failed');
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, submit };
}
