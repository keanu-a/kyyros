import { memo } from 'react';

import type { Comment } from '@/lib/api/comments';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type CommentMarkerProps = {
  comment: Comment;
  position: number;
  isActive: boolean;
};

const AVATAR_SIZE = 24;

function CommentMarkerComponent({
  comment,
  position,
  isActive,
}: CommentMarkerProps) {
  const isLeftHalf = position < 50;
  const style = {
    left: `clamp(0px, ${position}%, calc(100% - ${AVATAR_SIZE}px))`,
  };

  // Shortening long comments (can see full comment if clicked)
  let commentContent = comment.content;
  if (commentContent.length > 15) {
    commentContent = commentContent.slice(0, 15) + '...';
  }

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
          'absolute flex space-x-1 items-center bottom-8 text-xs bg-accent-foreground/50 px-2 rounded-2xl py-1',
          'pointer-events-none transition-opacity w-fit whitespace-nowrap',
          isLeftHalf ? 'left-0' : 'right-0',
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <span className='font-bold'>{comment.user.username}</span>
        <span>{commentContent}</span>
      </div>

      {/* Avatar button */}
      <Avatar
        className='opacity-20 cursor-pointer transition-opacity group-hover:opacity-100'
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        aria-label={`Comment by ${comment.user.username}`}
      >
        <AvatarImage
          src={comment.user.profilePictureUrl ?? undefined}
          alt={comment.user.username}
        />
        <AvatarFallback className='text-xs text-white bg-black'>
          {comment.user.username?.charAt(0)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

export const CommentMarker = memo(CommentMarkerComponent);
