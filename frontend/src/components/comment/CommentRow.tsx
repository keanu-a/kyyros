import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

import type { Comment } from '@/lib/api/comments';
import { formatTimestamp } from '@/lib/format-timestamp';
import { cn } from '@/lib/utils';

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
        'flex space-x-4 sm:space-x-0 px-2 py-4 rounded-md',
      )}
    >
      <div className='w-10 sm:w-14'>
        <Image
          src='/default-profile-picture.svg'
          alt={comment.user.username}
          width={10}
          height={10}
          className='rounded-full w-10 h-10'
        />
      </div>
      <div className='flex flex-col'>
        <div className='flex space-x-1 items-center'>
          <h1 className='font-bold'>{comment.user.username}</h1>
          {comment.timestampSeconds !== null && (
            <span
              className='text-sm text-muted-foreground hover:underline cursor-pointer'
              onClick={() => onSeek(comment.timestampSeconds ?? 0)}
            >
              {formatTimestamp(comment.timestampSeconds)}
            </span>
          )}
          <span>&middot;</span>
          <span className='text-sm text-muted-foreground'>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
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
