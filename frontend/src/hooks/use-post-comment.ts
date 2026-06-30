import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { createComment, type Comment } from '@/lib/api/comments';

export function usePostComment(
  videoId: string,
  onAddComment: (comment: Comment) => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (content: string, timestampSeconds: number) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    // Check session since only signed in users can comment
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // TODO: Create better UX for non-logged in users
      alert('Log in to commment');
      setError('auth');
      return false;
    }

    setIsSubmitting(true);
    try {
      const newComment = await createComment(videoId, {
        content: trimmedContent,
        timestampSeconds,
      });
      onAddComment(newComment);
      return true;
    } catch (e) {
      console.error('Failed to post comment', e);
      setError('failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, submit };
}
