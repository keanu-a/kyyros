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
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { MessageSquareMoreIcon } from 'lucide-react';

type MobileCommentSectionProps = {
  videoId: string;
  dockTop: number | null;
};

export default function MobileCommentSection({
  videoId,
  dockTop,
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
  const isMobile = useIsMobile();

  const [manualOpen, setManualOpen] = useState(false);

  const open = !!isMobile && (isSidebarOpen || manualOpen);
  const mode: 'all' | 'timestamped' = isSidebarOpen ? 'timestamped' : 'all';
  const comments = mode === 'timestamped' ? timestampedComments : allComments;

  // Stops page scrolling when comment drawer is open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setManualOpen(false);
      closeCommentSidebar();
    } else {
      setManualOpen(true);
    }
  };

  return (
    <Drawer modal={false} open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger
        className={cn(
          'w-full flex flex-col cursor-pointer',
          buttonVariants({ variant: 'outline' }),
        )}
      >
        <h2 className='font-bold flex items-center gap-1'>
          <MessageSquareMoreIcon />
          Comments{' '}
          <span className='font-medium text-muted-foreground'>
            ({allComments.length})
          </span>
        </h2>
      </DrawerTrigger>
      <DrawerContent
        className='max-h-none! mt-0!'
        style={dockTop != null ? { top: dockTop } : undefined}
      >
        <DrawerHeader>
          <DrawerTitle>{comments.length} Comments</DrawerTitle>
        </DrawerHeader>
        <div className='px-2 pb-2'>
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
