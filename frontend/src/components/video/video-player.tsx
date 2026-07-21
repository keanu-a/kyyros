'use client';

import { ComponentRef, useEffect, useRef, useState } from 'react';
import MuxVideo from '@mux/mux-video-react';
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from 'media-chrome/react';

import CommentMarkers from './comment-markers';

import { useIsHydrated } from '@/hooks/use-is-hydrated';
import { usePostComment } from '@/hooks/use-post-comment';
import { useComments } from '@/contexts/comments-context';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

import styles from './video-player.module.css';

type VideoPlayerProps = {
  playbackId: string | null;
  videoId: string;
  title: string;
  videoRef: React.RefObject<ComponentRef<typeof MuxVideo> | null>;
  mediaControllerRef: (el: ComponentRef<typeof MediaController> | null) => void;
};

export default function VideoPlayer({
  playbackId,
  videoId,
  title,
  videoRef,
  mediaControllerRef,
}: VideoPlayerProps) {
  const { handleAddComment } = useComments();

  const [isTypingComment, setIsTypingComment] = useState<boolean>(false);
  const [content, setContent] = useState('');

  const commentInputRef = useRef<HTMLInputElement>(null);

  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const resetIdleTimer = (skipSchedule = false) => {
    setIsIdle(false);
    clearTimeout(idleTimeoutRef.current);
    if (skipSchedule) return;
    idleTimeoutRef.current = setTimeout(() => setIsIdle(true), 3000);
  };

  const isHydrated = useIsHydrated();
  const { submit, isSubmitting, error } = usePostComment(
    videoId,
    handleAddComment,
  );

  const handleSubmit = async () => {
    const ok = await submit(content, videoRef.current?.currentTime ?? 0);
    if (ok) {
      setContent('');
      setIsTypingComment(false);
      resetIdleTimer();
      commentInputRef.current?.blur();
    }
  };

  const [timeRangeBarEl, setTimeRangeBarEl] = useState<ComponentRef<
    typeof MediaControlBar
  > | null>(null);
  const [controlBarEl, setControlBarEl] = useState<ComponentRef<
    typeof MediaControlBar
  > | null>(null);
  const [timeRangeBarHeight, setTimeRangeBarHeight] = useState(0);
  const [controlBarHeight, setControlBarHeight] = useState(0);

  useEffect(() => {
    if (!timeRangeBarEl || !controlBarEl) return;

    const timeRangeObserver = new ResizeObserver(([entry]) => {
      setTimeRangeBarHeight(entry.target.getBoundingClientRect().height);
    });
    const controlObserver = new ResizeObserver(([entry]) => {
      setControlBarHeight(entry.target.getBoundingClientRect().height - 2);
    });

    timeRangeObserver.observe(timeRangeBarEl);
    controlObserver.observe(controlBarEl);

    return () => {
      timeRangeObserver.disconnect();
      controlObserver.disconnect();
    };
  }, [timeRangeBarEl, controlBarEl]);

  const idleOffset = controlBarHeight + timeRangeBarHeight / 2;

  const [isPaused, setIsPaused] = useState(true);
  useEffect(() => {
    if (!isHydrated) return;
    const el = videoRef.current;
    if (!el) return;

    const handlePause = () => setIsPaused(true);
    const handlePlay = () => setIsPaused(false);

    el.addEventListener('pause', handlePause);
    el.addEventListener('play', handlePlay);

    return () => {
      el.removeEventListener('pause', handlePause);
      el.removeEventListener('play', handlePlay);
    };
  }, [isHydrated]);

  // Placeholder reserves layout so theres no shift when the player swaps i
  if (!isHydrated) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: '#000',
          backgroundImage: `url(https://image.mux.com/${playbackId}/thumbnail.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }

  return (
    <MediaController
      ref={mediaControllerRef}
      className={cn(styles.player, isIdle && 'in-fullscreen:cursor-none')}
      noHotkeys={isTypingComment || undefined}
      onMouseMove={() => resetIdleTimer(isTypingComment)}
      onMouseLeave={() => setIsIdle(true)}
      autohide='-1'
    >
      <MuxVideo
        ref={videoRef}
        slot='media'
        playbackId={playbackId ?? undefined}
        metadata={{ title }}
        crossOrigin=''
        playsInline
        style={{ width: '100%', height: '100%' }}
      />

      <div
        className='w-full transition-transform duration-300'
        style={{
          transform:
            isIdle && !isPaused ? `translateY(${idleOffset}px)` : undefined,
        }}
      >
        <MediaControlBar
          ref={setTimeRangeBarEl}
          className={cn(styles.timeRangeBar, 'w-full')}
        >
          <div className={styles.timeline}>
            <div className={styles.commentStrip}>
              <CommentMarkers videoRef={videoRef} />
            </div>
            <MediaTimeRange />
          </div>
        </MediaControlBar>

        <MediaControlBar ref={setControlBarEl} className={styles.controlBar}>
          <div className={styles.leftControls}>
            <MediaPlayButton />
            <MediaTimeDisplay showDuration />
            <div className={styles.volumeControls}>
              <MediaMuteButton />
              <MediaVolumeRange />
            </div>
          </div>

          <Input
            ref={commentInputRef}
            className={cn(styles.commentInput, 'text-sm px-4')}
            placeholder='Comment...'
            value={content}
            onClick={(e) => e.stopPropagation()}
            onFocus={() => {
              setIsTypingComment(true);
              setIsIdle(false);
              clearTimeout(idleTimeoutRef.current);
            }}
            onBlur={() => {
              setIsTypingComment(false);
              resetIdleTimer();
            }}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />

          <div className='flex space-x-2'>
            <MediaFullscreenButton />
          </div>
        </MediaControlBar>
      </div>
    </MediaController>
  );
}
