import { ComponentRef, RefObject } from 'react';
import type MuxVideo from '@mux/mux-video-react';

import { useActiveComment } from '@/hooks/use-active-comment';
import { useComments } from '@/contexts/comments-context';
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

  const activeComment = timestampedComments.find((c) => c.id === activeId);
  if (!activeComment) return null;

  const commentContent =
    activeComment.content.length > MAX_BUBBLE_COMMENT_LENGTH
      ? activeComment.content.slice(0, MAX_BUBBLE_COMMENT_LENGTH) + '...'
      : activeComment.content;

  return (
    <div
      className='absolute bottom-6 text-background left-2 flex items-center gap-1.5 bg-accent-foreground/50 py-1 pl-1 pr-2 rounded-2xl text-xs max-w-[80%] cursor-pointer'
      onClick={() => openCommentSidebarAt(activeComment.id)}
    >
      <Avatar style={{ width: 20, height: 20 }} className='shrink-0'>
        <AvatarImage
          src={activeComment.user.profilePictureUrl ?? undefined}
          alt={activeComment.user.username}
        />
        <AvatarFallback className='text-xs text-background bg-foreground'>
          {activeComment.user.username?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className='font-bold truncate'>{activeComment.user.username}</span>
      <span className='truncate'>{commentContent}</span>
    </div>
  );
}
