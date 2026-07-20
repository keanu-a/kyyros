import type { Comment } from '@/lib/api/comments';
import { CommentRow } from '../comment/comment-row';
import { useEffect, useRef } from 'react';

type CommentListProps = {
  comments: Comment[];
  onSeek: (timestampSeconds: number) => void;
  selectedCommentId?: string | null;
};

export default function CommentList({
  comments,
  onSeek,
  selectedCommentId,
}: CommentListProps) {
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  useEffect(() => {
    if (!selectedCommentId) return;
    const el = rowRefs.current.get(selectedCommentId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedCommentId]);

  if (!comments.length)
    return (
      <p className='text-sm text-muted-foreground pb-6'>
        Be the first to comment!
      </p>
    );

  return (
    <ul className='flex flex-col space-y-8'>
      {comments.map((comment) => (
        <li
          key={comment.id}
          ref={(el) => {
            if (el) rowRefs.current.set(comment.id, el);
            else rowRefs.current.delete(comment.id);
          }}
        >
          <CommentRow
            comment={comment}
            onSeek={onSeek}
            isSelected={comment.id === selectedCommentId}
          />
        </li>
      ))}
    </ul>
  );
}
