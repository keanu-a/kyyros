import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

import type { Comment } from '@/lib/api/comments';
import { formatTimestamp } from '@/lib/format-timestamp';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const AVATAR_SIZE = 24;

type CommentRowProps = {
  comment: Comment;
  onSeek: (timestampSeconds: number) => void;
  isSelected?: boolean;
};

export function CommentRow({ comment, onSeek, isSelected }: CommentRowProps) {
  return (
    <div
      className={cn(
        isSelected && 'animate-[flash-highlight_4s_ease-out]',
        'flex space-x-2 px-2 py-4 rounded-md',
      )}
    >
      <Avatar
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        aria-label={`Comment by ${comment.user.username}`}
      >
        <AvatarImage
          src={comment.user.profilePictureUrl ?? undefined}
          alt={comment.user.username}
        />
        <AvatarFallback className='text-xs text-background bg-foreground'>
          {comment.user.username?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className='flex flex-col'>
        <div className='flex flex-col lg:gap-2 lg:flex-row'>
          <h1 className='font-bold'>{comment.user.username}</h1>
          <div className='space-x-1'>
            {comment.timestampSeconds !== null && (
              <span
                className='text-sm text-muted-foreground hover:underline cursor-pointer'
                onClick={() => onSeek(comment.timestampSeconds ?? 0)}
              >
                {formatTimestamp(comment.timestampSeconds)}
              </span>
            )}
            <span
              className={cn(
                comment.timestampSeconds !== null ? '' : 'hidden lg:inline',
              )}
            >
              &middot;
            </span>
            <span className='text-sm text-muted-foreground'>
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <p className='whitespace-pre-wrap'>{comment.content}</p>

        {/* TODO: Add like and reply comment feature */}
        {/* <div className='flex space-x-6 *:mt-4 text-muted-foreground'>
          <Button variant='link' className='p-0 mt-2 cursor-pointer'>
            Like
          </Button>
          <Button variant='link' className='p-0 mt-2 cursor-pointer'>
            Reply
          </Button>
        </div> */}
      </div>
    </div>
  );
}
