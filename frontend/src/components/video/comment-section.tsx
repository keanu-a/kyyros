import Image from 'next/image';

import CommentInput from '../comment/CommentInput';
import { useComments } from '@/contexts/comments-context';
import CommentList from './comment-list';

export default function CommentSection({ videoId }: { videoId: string }) {
  const { allComments, handleAddComment, seekToTimestamp } = useComments();

  return (
    <div className='w-full md:w-3/4'>
      <h2 className='font-semibold mb-4'>Comments</h2>

      <div className='mb-10 flex space-x-2 w-full'>
        <div className='flex space-x-4 max-w-10 items-center'>
          <Image
            src='/default-profile-picture.svg'
            alt='test user'
            width={24}
            height={24}
            className='rounded-full w-auto h-auto'
          />
        </div>
        <CommentInput videoId={videoId} onAddComment={handleAddComment} />
      </div>

      <CommentList comments={allComments} onSeek={seekToTimestamp} />
    </div>
  );
}
