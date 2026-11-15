'use client';

import { HeartIcon } from 'lucide-react';

import type { Comment } from '@/lib/api/comments';
import { useCommentLike } from '@/hooks/use-comment-like';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

type CommentLikeButtonProps = {
  comment: Comment;
};

export default function CommentLikeButton({ comment }: CommentLikeButtonProps) {
  const { likeCount, likedByMe, toggleLike } = useCommentLike(comment);

  // Fixed height (h-6) so the row doesn't grow when the count appears
  return (
    <Button
      variant='ghost'
      size='sm'
      className='h-6 cursor-pointer gap-1 px-2 py-1 text-muted-foreground rounded-full'
      onClick={toggleLike}
      aria-pressed={likedByMe}
      aria-label={likedByMe ? 'Unlike comment' : 'Like comment'}
    >
      <HeartIcon
        className={cn('size-4', likedByMe && 'fill-red-500 text-red-500')}
      />
      {likeCount > 0 && (
        <span className='text-sm tabular-nums'>
          {likeCount.toLocaleString()}
        </span>
      )}
    </Button>
  );
}
