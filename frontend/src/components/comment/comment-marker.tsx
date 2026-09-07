import { memo } from 'react';

import { cn } from '@/lib/utils';
import { Comment } from '@/lib/api/comments';
import UserAvatar from '../user-avatar';

const AVATAR_SIZE = 24;
const MAX_BUBBLE_COMMENT_LENGTH = 30;

type CommentMarkerProps = {
  comment: Comment;
  position: number;
  isActive: boolean;
  onSelect: (id: string) => void;
};

function CommentMarkerComponent({
  comment,
  position,
  isActive,
  onSelect,
}: CommentMarkerProps) {
  const isLeftHalf = position < 50;

  // Shortening long comments (can see full comment if clicked)
  const commentContent =
    comment.content.length > MAX_BUBBLE_COMMENT_LENGTH
      ? comment.content.slice(0, MAX_BUBBLE_COMMENT_LENGTH) + '...'
      : comment.content;

  const style = {
    left: `clamp(0px, ${position}%, calc(100% - ${AVATAR_SIZE}px))`,
  };

  return (
    <div
      className={cn(
        'group absolute bottom-3',
        'z-0 hover:z-20',
        isActive && 'z-10',
      )}
      style={style}
    >
      {/* Comment bubble */}
      <div
        className={cn(
          'absolute flex space-x-1 items-center bottom-7 text-xs bg-accent-foreground/70 px-2 rounded-2xl py-1',
          'pointer-events-none transition-opacity w-fit whitespace-nowrap',
          isLeftHalf ? 'left-0' : 'right-0',
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <span className='font-bold'>{comment.user.username}</span>
        <span>{commentContent}</span>
      </div>

      <span
        className='opacity-20 cursor-pointer transition-opacity group-hover:opacity-100'
        onClick={() => onSelect(comment.id)}
      >
        <UserAvatar
          name={comment.user.username}
          avatarUrl={comment.user.profilePictureUrl ?? undefined}
        />
      </span>
    </div>
  );
}

export const CommentMarker = memo(CommentMarkerComponent);
