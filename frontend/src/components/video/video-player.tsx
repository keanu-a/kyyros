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
import { useIdleState } from '@/hooks/use-idle-state';
import { useElementSize } from '@/hooks/use-element-size';
import { useVideoPauseState } from '@/hooks/use-video-pause-state';
import { cn } from '@/lib/utils';

import styles from './video-player.module.css';
import { useVideoTime } from '@/hooks/use-video-time';
import VideoCommentInput from './video-comment-input';

type VideoPlayerProps = {
  playbackId: string | null;
  videoId: string;
  title: string;
  videoRef: React.RefObject<ComponentRef<typeof MuxVideo> | null>;
  mediaControllerRef: (el: ComponentRef<typeof MediaController> | null) => void;
  mediaControllerEl: ComponentRef<typeof MediaController> | null;
};

export default function VideoPlayer({
  playbackId,
  videoId,
  title,
  videoRef,
  mediaControllerRef,
  mediaControllerEl,
}: VideoPlayerProps) {
  // External hooks
  const isHydrated = useIsHydrated();

  // Component-specific hooks
  const { isIdle, setIsIdle, resetIdleTimer } = useIdleState();
  const { setEl: setTimeRangeBarEl, height: timeRangeBarHeight } =
    useElementSize<ComponentRef<typeof MediaControlBar>>();
  const { setEl: setControlBarEl, height: controlBarHeight } =
    useElementSize<ComponentRef<typeof MediaControlBar>>();
  const { isPaused } = useVideoPauseState(isHydrated, videoRef);
  const { currentTime } = useVideoTime(videoRef, isHydrated);

  // Local state
  const [isTypingComment, setIsTypingComment] = useState<boolean>(false);

  useEffect(() => {
    if (!mediaControllerEl) return;

    const handleUserInactiveChange = () => {
      // Force it back to false whenever media-chrome tries to set it true
      mediaControllerEl.userInteractive = false;
    };

    mediaControllerEl.addEventListener(
      'userinactivechange',
      handleUserInactiveChange,
    );

    // Also clear it immediately on mount, in case it's already true
    mediaControllerEl.userInteractive = false;

    return () => {
      mediaControllerEl.removeEventListener(
        'userinactivechange',
        handleUserInactiveChange,
      );
    };
  }, [mediaControllerEl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' && e.code !== 'Space') return;
      if (isTypingComment) return;

      const active = document.activeElement;
      const isInsidePlayer = mediaControllerEl?.contains(active);
      if (e.code === 'Space' && isInsidePlayer) return; // let media-chrome's own hotkey handle it

      const isEditingElsewhere =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active as HTMLElement)?.isContentEditable;
      if (isEditingElsewhere) return;

      e.preventDefault();
      if (e.key === '/') {
        commentInputRef.current?.focus({ preventScroll: true });
      } else {
        const el = videoRef.current;
        if (!el) return;
        if (el.paused) el.play();
        else el.pause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTypingComment, mediaControllerEl]);

  // Refs
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Derived
  const idleOffset = controlBarHeight - 2 + timeRangeBarHeight / 2;

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
      onMouseLeave={() => {
        if (!isTypingComment) setIsIdle(true);
      }}
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
              <CommentMarkers videoRef={videoRef} isHydrated={isHydrated} />
            </div>
            <MediaTimeRange />
          </div>
        </MediaControlBar>

        <MediaControlBar
          ref={setControlBarEl}
          className={cn(styles.controlBar, 'gap-1 sm:gap-4 md:gap-12')}
        >
          <div className='flex gap-1'>
            <MediaPlayButton />
            <MediaTimeDisplay showDuration />
            <div className={styles.volumeControls}>
              <MediaMuteButton />
              <MediaVolumeRange />
            </div>
          </div>

          <VideoCommentInput
            ref={commentInputRef}
            videoId={videoId}
            videoRef={videoRef}
            currentTime={currentTime}
            resetIdleTimer={resetIdleTimer}
            onTypingChange={setIsTypingComment}
          />

          <div className='flex space-x-2'>
            <MediaFullscreenButton />
          </div>
        </MediaControlBar>
      </div>
    </MediaController>
  );
}
