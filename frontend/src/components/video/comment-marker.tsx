import { memo } from 'react';

import type { CommentCluster } from '@/hooks/use-comment-clusters';
import { cn } from '@/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '../ui/avatar';

const AVATAR_SIZE = 24;
const MAX_AVATARS_SHOWN = 2;
const AVATAR_STACK_OVERLAP = 16;

type CommentMarkerProps = {
  commentCluster: CommentCluster;
  isActive: boolean;
};

function CommentMarkerComponent({
  commentCluster,
  isActive,
}: CommentMarkerProps) {
  const { position, comments, topComment } = commentCluster;
  const isLeftHalf = position < 50;
  const overflowCount = Math.max(0, comments.length - MAX_AVATARS_SHOWN);
  const displayedComments = comments.slice(0, MAX_AVATARS_SHOWN);

  // Shortening long comments (can see full comment if clicked)
  let commentContent = topComment.content;
  if (commentContent.length > 15) {
    commentContent = commentContent.slice(0, 15) + '...';
  }

  // Cluster width so clamp keeps the whole group inside the strip
  const clusterWidthPx =
    AVATAR_SIZE +
    (displayedComments.length - 1) * (AVATAR_SIZE - AVATAR_STACK_OVERLAP) +
    (overflowCount > 0 ? AVATAR_SIZE - AVATAR_STACK_OVERLAP : 0);

  const style = {
    left: `clamp(0px, ${position}%, calc(100% - ${clusterWidthPx}px))`,
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
          'absolute flex space-x-1 items-center bottom-7 text-xs bg-accent-foreground/50 px-2 rounded-2xl py-1',
          'pointer-events-none transition-opacity w-fit whitespace-nowrap',
          isLeftHalf ? 'left-0' : 'right-0',
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <span className='font-bold'>{topComment.user.username}</span>
        <span>{commentContent}</span>
      </div>

      <AvatarGroup
        className={cn(
          'opacity-20 cursor-pointer transition-opacity group-hover:opacity-100',
          '-space-x-4 *:data-[slot=avatar]:ring-1 *:data-[slot=avatar]:ring-background',
        )}
        aria-label={`${comments.length} comment${comments.length === 1 ? '' : 's'}`}
      >
        {displayedComments.map((comment) => (
          <Avatar
            key={comment.id}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          >
            <AvatarImage
              src={comment.user.profilePictureUrl ?? undefined}
              alt={comment.user.username}
            />
            <AvatarFallback className='text-xs text-background bg-foreground'>
              {comment.user.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
        {overflowCount > 0 && (
          <AvatarGroupCount
            className='text-xs ring-1 bg-white/70 text-neutral-900 backdrop-blur-sm'
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          >
            +{overflowCount}
          </AvatarGroupCount>
        )}
      </AvatarGroup>
    </div>
  );
}

export const CommentMarker = memo(CommentMarkerComponent);
