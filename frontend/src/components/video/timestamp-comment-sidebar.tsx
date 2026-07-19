import { ChevronsRightIcon } from 'lucide-react';

import { useComments } from '@/contexts/comments-context';
import { Button } from '../ui/button';
import CommentList from './comment-list';

export default function TimestampCommentSidebar() {
  const {
    timestampedComments,
    seekToTimestamp,
    isSidebarOpen,
    closeCommentSidebar,
    selectedCommentId,
  } = useComments();

  if (!isSidebarOpen) return <></>;

  return (
    <div className='hidden landscape:flex sm:flex flex-col h-[90vh] border rounded-md bg-background'>
      <div>
        <Button
          className='rounded-full cursor-pointer m-2 shrink-0'
          variant='ghost'
          onClick={closeCommentSidebar}
        >
          <ChevronsRightIcon />
        </Button>
      </div>
      <div className='flex-1 min-h-0 overflow-scroll px-4 pb-6'>
        <CommentList
          comments={timestampedComments}
          onSeek={seekToTimestamp}
          selectedCommentId={selectedCommentId}
        />
      </div>
    </div>
  );
}
