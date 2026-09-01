import TimestampCommentSidebar from '../comment/timestamp-comment-sidebar';
import VideoList from './video-list';

import { useComments } from '@/contexts/comments-context';
import { VideoSummaryResponse } from '@/lib/api/videos';

type VideoPageClientAsideProps = {
  videos: VideoSummaryResponse[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: string | null;
};

export default function VideoPageClientAside({
  videos,
  isLoading,
  hasMore,
  loadMore,
  error,
}: VideoPageClientAsideProps) {
  const { isSidebarOpen } = useComments();

  return (
    <aside className='mb-4'>
      {isSidebarOpen && (
        <div className='mb-2'>
          <TimestampCommentSidebar />
        </div>
      )}

      <VideoList
        videos={videos}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        error={error}
      />
    </aside>
  );
}
