import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import type { Comment } from '@/lib/api/comments';

import { Button } from '../ui/button';
import { CommentRow } from './comment-row';
import ReplyInput from './reply-input';

type CommentThreadProps = {
  comment: Comment;
  onSeek: (timestampSeconds: number) => void;
  isSelected?: boolean;
};

// The comment whose Reply button was clicked. The input renders under that row.
type ReplyTarget = {
  commentId: string;
  initialContent: string;
};

// Indentation lines up with the row layout: px-2 (8px) + 24px avatar + space-x-2 (8px) = 40px to the text.
// Replies are indented 32px so their avatar sits under the root's text.
export default function CommentThread({
  comment,
  onSeek,
  isSelected,
}: CommentThreadProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);

  const replyCount = comment.replies.length;

  // Replying to the root starts empty. Replying to a reply mentions its author,
  // but still posts to the root so the thread stays one level deep.
  const handleReply = (target: Comment) => {
    setReplyTarget({
      commentId: target.id,
      initialContent:
        target.id === comment.id ? '' : `@${target.user.username} `,
    });
  };

  const handleReplySubmitted = () => {
    setReplyTarget(null);
    setIsExpanded(true);
  };

  const renderReplyInput = (commentId: string) =>
    replyTarget?.commentId === commentId && (
      <div className='pl-10 pr-2'>
        <ReplyInput
          // New key per target so the @mention prefill updates when switching replies
          key={replyTarget.commentId}
          rootCommentId={comment.id}
          initialContent={replyTarget.initialContent}
          onCancel={() => setReplyTarget(null)}
          onSubmitted={handleReplySubmitted}
        />
      </div>
    );

  return (
    <div className='flex flex-col'>
      <CommentRow
        comment={comment}
        onSeek={onSeek}
        onReply={handleReply}
        isSelected={isSelected}
      />
      {renderReplyInput(comment.id)}

      {replyCount > 0 && (
        <div className='pl-8'>
          <Button
            variant='ghost'
            size='sm'
            className='h-6 cursor-pointer gap-1 px-2 py-1 font-semibold rounded-full'
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronUpIcon className='size-4' />
            ) : (
              <ChevronDownIcon className='size-4' />
            )}
            {isExpanded
              ? 'Hide replies'
              : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
          </Button>
        </div>
      )}

      {isExpanded && replyCount > 0 && (
        <ul className='flex flex-col pl-8'>
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentRow
                comment={reply}
                onSeek={onSeek}
                onReply={handleReply}
                isReply
              />
              {renderReplyInput(reply.id)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
