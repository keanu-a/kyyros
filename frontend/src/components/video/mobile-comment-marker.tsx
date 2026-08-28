import { ComponentRef, RefObject } from 'react';
import MuxVideo from '@mux/mux-video-react';

import { useActiveComment } from '@/hooks/use-active-comment';
import { useComments } from '@/contexts/comments-context';
import { cn } from '@/lib/utils';
import { Comment } from '@/lib/api/comments';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const MAX_BUBBLE_COMMENT_LENGTH = 30;

type MobileCommentBubbleProps = {
  videoRef: RefObject<ComponentRef<typeof MuxVideo> | null>;
};

export default function MobileCommentBubble({
  videoRef,
}: MobileCommentBubbleProps) {
  const { timestampedComments, openCommentSidebarAt } = useComments();
  const activeId = useActiveComment(videoRef, timestampedComments);

  return (
    <>
      {timestampedComments.map((comment) => (
        <MobileBubbleItem
          key={comment.id}
          comment={comment}
          isActive={comment.id === activeId}
          onSelect={openCommentSidebarAt}
        />
      ))}
    </>
  );
}

type MobileBubbleItemProps = {
  comment: Comment;
  isActive: boolean;
  onSelect: (id: string) => void;
};

function MobileBubbleItem({
  comment,
  isActive,
  onSelect,
}: MobileBubbleItemProps) {
  const commentContent =
    comment.content.length > MAX_BUBBLE_COMMENT_LENGTH
      ? comment.content.slice(0, MAX_BUBBLE_COMMENT_LENGTH) + '...'
      : comment.content;

  return (
    <div
      className={cn(
        'absolute text-background bottom-6 left-2 flex items-center gap-1.5 bg-accent-foreground/50 px-2 py-1 rounded-2xl text-xs max-w-[80%] cursor-pointer',
        'transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      onClick={() => onSelect(comment.id)}
    >
      <Avatar style={{ width: 20, height: 20 }} className='shrink-0'>
        <AvatarImage
          src={comment.user.profilePictureUrl ?? undefined}
          alt={comment.user.username}
        />
        <AvatarFallback className='text-xs text-background bg-foreground'>
          {comment.user.username?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className='font-bold truncate'>{comment.user.username}</span>
      <span className='truncate'>{commentContent}</span>
    </div>
  );
}
