import CommentInput from './comment-input';
import { useComments } from '@/contexts/comments-context';
import CommentList from './comment-list';
import UserAvatar from '../user-avatar';
import { useUser } from '@/contexts/user-context';

export default function CommentSection({ videoId }: { videoId: string }) {
  const { allComments, handleAddComment, seekToTimestamp } = useComments();
  const { user } = useUser();

  return (
    <div className='w-full px-2 md:px-0'>
      <h2 className='font-semibold mb-4'>Comments</h2>

      <div className='mb-10 flex space-x-2 w-full'>
        <div className='flex space-x-4 max-w-10 items-center'>
          <UserAvatar
            name={user?.username ?? '-'}
            avatarUrl={user?.profilePictureUrl ?? undefined}
          />
        </div>
        <CommentInput videoId={videoId} onAddComment={handleAddComment} />
      </div>

      <CommentList comments={allComments} onSeek={seekToTimestamp} />
    </div>
  );
}
