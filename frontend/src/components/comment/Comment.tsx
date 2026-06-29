import type { Comment } from '@/lib/api/comments';
import { formatTimestamp } from '@/lib/format-timestamp';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

type CommentProps = {
  comment: Comment;
};

export function Comment({ comment }: CommentProps) {
  return (
    <div className='flex space-x-4'>
      <Image
        src={'/default-profile-picture.svg'}
        alt={comment.user.username}
        width={48}
        height={36}
        className='rounded-full'
      />
      <div className='flex flex-col'>
        <div className='flex space-x-1 items-center'>
          <h1 className='font-bold'>{comment.user.username}</h1>
          <span className='text-sm text-muted-foreground'>
            at {formatTimestamp(comment.timestampSeconds)}
          </span>
          <span>&middot;</span>
          <span className='text-sm text-muted-foreground'>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p>{comment.content}</p>
      </div>
    </div>
  );
}
