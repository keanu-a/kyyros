import { useComments } from '@/contexts/comments-context';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import CommentList from './comment-list';
import CommentInput from './comment-input';
import { useState } from 'react';

type MobileCommentSectionProps = {
  videoId: string;
};

export default function MobileCommentSection({
  videoId,
}: MobileCommentSectionProps) {
  const {
    allComments,
    isSidebarOpen,
    timestampedComments,
    seekToTimestamp,
    selectedCommentId,
    handleAddComment,
    closeCommentSidebar,
  } = useComments();

  const [manualOpen, setManualOpen] = useState(false);

  const open = isSidebarOpen || manualOpen;
  const mode: 'all' | 'timestamped' = isSidebarOpen ? 'timestamped' : 'all';
  const comments = mode === 'timestamped' ? timestampedComments : allComments;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setManualOpen(false);
      closeCommentSidebar();
    } else {
      setManualOpen(true);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger
        className={cn(
          'w-full flex flex-col',
          buttonVariants({ variant: 'outline' }),
        )}
      >
        <h2 className='font-bold'>See {comments.length} Comments</h2>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{comments.length} Comments</DrawerTitle>
        </DrawerHeader>
        <div className='px-2 py-2'>
          <CommentInput videoId={videoId} onAddComment={handleAddComment} />
        </div>
        <div className='overflow-y-scroll px-2'>
          <CommentList
            comments={comments}
            onSeek={seekToTimestamp}
            selectedCommentId={selectedCommentId}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
