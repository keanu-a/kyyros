'use client';

import { ComponentRef, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import type { MediaController } from 'media-chrome/react';
import type MuxVideo from '@mux/mux-video-react';
import { formatDistanceToNow } from 'date-fns';

import { GetVideoResponse } from '@/lib/api/videos';
import type { Comment } from '@/lib/api/comments';
import { CommentsProvider } from '@/contexts/comments-context';

import { Button } from '../ui/button';
import VideoPlayer from './video-player';
import CommentSection from './comment-section';
import TimestampCommentSidebar from './timestamp-comment-sidebar';
import FullscreenSidebarSlot from './fullscreen-sidebar-slot';

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
            />
            <FullscreenSidebarSlot />
          </div>

          <div className='px-4 my-4'>
            {/* Video Details */}
            <div className='border rounded-lg p-4 w-full'>
              {/* Title + timestamp */}
              <h1 className='font-bold text-xl mb-1'>{video.title}</h1>
              <p className='text-sm text-muted-foreground mb-4'>
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                })}
              </p>

              {/* Byline row */}
              <div className='flex items-center mb-4 space-x-6'>
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
                <Button className='text-xs px-3 py-1.5 rounded-full'>
                  Follow
                </Button>
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
