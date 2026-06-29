import { memo } from 'react';
import Image from 'next/image';

import type { Comment } from '@/lib/api/comments';
import { cn } from '@/lib/utils';

type CommentMarkerProps = {
  comment: Comment;
  position: number;
  isActive: boolean;
};

function CommentMarkerComponent({
  comment,
  position,
  isActive,
}: CommentMarkerProps) {
  const isLeftHalf = position < 50;

  const sideStyle = isLeftHalf
    ? { left: `${position}%` }
    : { right: `${98 - position}%` };

  // Shortening long comments (can see full comment if clicked)
  let commentContent = comment.content;
  if (commentContent.length > 15) {
    commentContent = commentContent.slice(0, 15) + '...';
  }

  return (
    <div className='group absolute bottom-3' style={sideStyle}>
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
      <div
        className={cn(
          'opacity-30 cursor-pointer rounded-full bg-transparent leading-0',
          'transition-opacity group-hover:opacity-100',
        )}
        aria-label={`Comment by ${comment.user.username}`}
      >
        <Image
          src={'/default-profile-picture.svg'}
          alt={comment.user.username}
          width={24}
          height={24}
          className='rounded-full'
        />
      </div>
    </div>
  );
}

export const CommentMarker = memo(CommentMarkerComponent);
