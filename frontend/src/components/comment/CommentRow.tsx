import type { Comment } from '@/lib/api/comments';
import { formatTimestamp } from '@/lib/format-timestamp';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Button } from '../ui/button';

type CommentRowProps = {
  comment: Comment;
  onSeek: (timestampSeconds: number) => void;
};

export function CommentRow({ comment, onSeek }: CommentRowProps) {
  return (
    <div className='flex space-x-4'>
      <div className='w-10 sm:w-14'>
        <Image
          src='/default-profile-picture.svg'
          alt={comment.user.username}
          width={10}
          height={10}
          className='rounded-full w-auto h-auto'
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
              at {formatTimestamp(comment.timestampSeconds)}
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
        <div className='flex space-x-6 *:mt-4 text-muted-foreground'>
          <Button variant='link' className='p-0 mt-2 cursor-pointer'>
            Like
          </Button>
          <Button variant='link' className='p-0 mt-2 cursor-pointer'>
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
