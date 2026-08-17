'use client';

import { ComponentRef, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Ellipsis, EllipsisIcon, Trash2, Trash2Icon } from 'lucide-react';

import type { MediaController } from 'media-chrome/react';
import type MuxVideo from '@mux/mux-video-react';

import { deleteVideo, GetVideoResponse } from '@/lib/api/videos';
import type { Comment } from '@/lib/api/comments';
import { CommentsProvider } from '@/contexts/comments-context';
import { useUser } from '@/contexts/user-context';

import VideoPlayer from './video-player';
import CommentSection from './comment-section';
import TimestampCommentSidebar from './timestamp-comment-sidebar';
import FullscreenSidebarSlot from './fullscreen-sidebar-slot';
import { Button, buttonVariants } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleOpenDialog = () => {
    setIsPopoverOpen(false);
    setIsDialogOpen(true);
  };

  // const handleDeleteVideo = async () => {
  //   setIsDeleting(true);
  //   setDeleteError(null);
  //   try {
  //     await deleteVideo(video.id);
  //   } catch (error) {
  //     console.error('Error deleting video:', error);
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  // Handles setting fullscreen ref when DOM is ready
  useEffect(() => {
    if (wrapperEl && mediaControllerEl) {
      // eslint-disable-next-line react-hooks/immutability -- setting DOM property, not React state
      mediaControllerEl.fullscreenElement = wrapperEl;
    }
  }, [wrapperEl, mediaControllerEl]);

  return (
    <CommentsProvider comments={comments} seekToTimestamp={seekToTimestamp}>
      <div className='max-w-[1600px] mx-auto flex space-x-2 sm:px-2'>
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

          <div className='px-4 my-4'>
            {/* Video Details */}
            <div className='border rounded-lg p-4 w-full'>
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
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className='cursor-pointer'>
                        <EllipsisIcon />
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

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          Are you sure you want to delete this video? This
                          action cannot be undone.
                        </DialogHeader>
                        <div>Wow</div>
                      </DialogContent>
                    </Dialog>
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
            <br />

            <CommentSection videoId={video.id} />
          </div>
        </div>

        <div className='hidden sm:w-64 md:w-72 lg:w-96 shrink-0 sm:flex flex-col'>
          <TimestampCommentSidebar />
        </div>
      </div>
    </CommentsProvider>
  );
}
