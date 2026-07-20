'use client';

import { useComments } from '@/contexts/comments-context';
import TimestampCommentSidebar from './timestamp-comment-sidebar';

export default function FullscreenSidebarSlot() {
  const { isSidebarOpen } = useComments();

  if (!isSidebarOpen) return null;

  return (
    <div className='hidden in-fullscreen:landscape:flex px-2 w-56 sm:w-64 md:w-72 lg:w-80 shrink-0'>
      <TimestampCommentSidebar />
    </div>
  );
}
