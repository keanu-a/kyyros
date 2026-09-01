'use client';

import { ComponentRef, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { EllipsisIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { MediaController } from 'media-chrome/react';
import type MuxVideo from '@mux/mux-video-react';

import { deleteVideo, GetVideoResponse } from '@/lib/api/videos';
import type { Comment } from '@/lib/api/comments';
import { CommentsProvider } from '@/contexts/comments-context';
import { useUser } from '@/contexts/user-context';

import VideoPlayer from './video-player';
import VideoList from './video-list';
import CommentSection from '../comment/comment-section';
import MobileCommentSection from '../comment/mobile-comment-section';
import FullscreenSidebarSlot from './fullscreen-sidebar-slot';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ConfirmDialog from '../confirm-dialog';
import VideoPageClientAside from './video-page-client-aside';
import VideoCommentInput from './video-comment-input';
import { useVideoTime } from '@/hooks/use-video-time';
import { useIsHydrated } from '@/hooks/use-is-hydrated';
import { useIdleState } from '@/hooks/use-idle-state';
import { useInfiniteVideos } from '@/hooks/use-infinite-videos';

const PAGE_SIZE = 5;

type VideoPageClientProps = {
  video: GetVideoResponse;
  comments: Comment[];
};

export default function VideoPageClient({
  video,
  comments,
}: VideoPageClientProps) {
  const videoRef = useRef<ComponentRef<typeof MuxVideo>>(null);
  const [wrapperEl, setWrapperEl] = useState<HTMLDivElement | null>(null);
  const [mediaControllerEl, setMediaControllerEl] = useState<ComponentRef<
    typeof MediaController
  > | null>(null);
  const { user, isAuthenticated } = useUser();
  const isHydrated = useIsHydrated();
  const { currentTime } = useVideoTime(videoRef, isHydrated);
  const { resetIdleTimer } = useIdleState();

  const { videos, loadMore, hasMore, isLoading, error } = useInfiniteVideos(
    PAGE_SIZE,
    video.id,
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  const handleConfirmDeleteVideo = async () => {
    setIsDeleting(true);
    try {
      await deleteVideo(video.id);
      setIsDialogOpen(false);
      router.push('/');
      toast.success('Video deleted successfully.', {
        position: 'top-center',
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video. Please try again later.', {
        position: 'top-center',
      });
      setIsDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Moves video playback to selected timestamp and plays video
  const seekToTimestamp = (timestampSeconds: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = timestampSeconds;
    el.play();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Handles setting fullscreen ref when DOM is ready
  useEffect(() => {
    if (wrapperEl && mediaControllerEl) {
      // eslint-disable-next-line react-hooks/immutability -- setting DOM property, not React state
      mediaControllerEl.fullscreenElement = wrapperEl;
    }
  }, [wrapperEl, mediaControllerEl]);

  const [commentInputWrapperEl, setCommentInputWrapperEl] =
    useState<HTMLDivElement | null>(null);
  const [dockTop, setDockTop] = useState<number | null>(null);

  useEffect(() => {
    if (!commentInputWrapperEl) return;

    const update = () => {
      setDockTop(commentInputWrapperEl.getBoundingClientRect().bottom);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [commentInputWrapperEl]);

  return (
    <CommentsProvider comments={comments} seekToTimestamp={seekToTimestamp}>
      <div className='max-w-[1850px] mx-auto flex sm:px-4 sm:gap-2'>
        <div className='flex flex-col w-full flex-1'>
          <div ref={setWrapperEl} className='flex items-center'>
            <VideoPlayer
              playbackId={video.playbackId}
              videoId={video.id}
              title={video.title}
              videoRef={videoRef}
              mediaControllerRef={setMediaControllerEl}
              mediaControllerEl={mediaControllerEl}
            />
            <FullscreenSidebarSlot />
          </div>

          {/* Mobile timestamp comment input */}
          <div
            ref={setCommentInputWrapperEl}
            className='w-full px-1 py-2 lg:hidden sm:px-0'
          >
            <VideoCommentInput
              videoId={video.id}
              videoRef={videoRef}
              currentTime={currentTime}
              resetIdleTimer={resetIdleTimer}
            />
          </div>

          <div className='lg:py-4'>
            {/* Video Details */}
            <div className='border p-4 w-full sm:rounded-lg mb-4 md:mb-8'>
              {/* Title + timestamp */}
              <h1 className='font-bold text-xl mb-1'>{video.title}</h1>
              <p className='text-sm text-muted-foreground mb-4'>
                {new Date(video.createdAt).toLocaleDateString(undefined, {
                  timeZone: 'UTC',
                  month: 'long',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </p>

              {/* Byline row */}
              <div className='flex items-center mb-4 space-x-6 justify-between w-full'>
                <div className='flex items-center gap-2'>
                  <Image
                    src='/default-profile-picture.svg'
                    alt={video.uploader?.username ?? 'uploader'}
                    width={32}
                    height={32}
                    className='rounded-full'
                  />
                  <span className='text-sm'>@{video.uploader?.username}</span>
                </div>
                {isAuthenticated && user?.id === video.uploader?.id && (
                  <div className='flex items-center gap-2'>
                    <DropdownMenu>
                      <DropdownMenuTrigger className='cursor-pointer'>
                        <EllipsisIcon size={20} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          variant='destructive'
                          className='cursor-pointer'
                          onSelect={() => setIsDialogOpen(true)}
                        >
                          <Trash2Icon />
                          Delete Video
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <ConfirmDialog
                      title='Delete Video'
                      open={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                      onConfirm={handleConfirmDeleteVideo}
                      isPending={isDeleting}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className='border-t pt-3'>
                <p className='whitespace-pre-wrap text-sm text-muted-foreground'>
                  {video.description}
                </p>
              </div>
            </div>

            <div className='hidden md:flex'>
              <CommentSection videoId={video.id} />
            </div>

            {/* Mobile comment section and video list */}
            <div className='px-2 flex flex-col gap-2 md:hidden'>
              <MobileCommentSection videoId={video.id} dockTop={dockTop} />
              <VideoList
                videos={videos}
                loadMore={loadMore}
                hasMore={hasMore}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </div>

        <div className='hidden sm:w-64 md:w-72 lg:w-96 shrink-0 md:flex flex-col'>
          <VideoPageClientAside
            videos={videos}
            loadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </CommentsProvider>
  );
}
