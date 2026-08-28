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
import MobileCommentMarker from './mobile-comment-marker';

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

  // Prevents media-chromes native hide/show transition and to only use our custom transitions
  useEffect(() => {
    if (!mediaControllerEl) return;

    const handleUserInactiveChange = () => {
      mediaControllerEl.userInteractive = false;
    };

    mediaControllerEl.addEventListener(
      'userinactivechange',
      handleUserInactiveChange,
    );
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
      const isEditingElsewhere =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active as HTMLElement)?.isContentEditable;
      if (isEditingElsewhere) return;

      e.preventDefault();

      if (e.code === 'Space') {
        const focusInsidePlayer =
          mediaControllerEl && active && mediaControllerEl.contains(active);
        if (focusInsidePlayer) return; // media-chrome's own hotkey already handles this

        const el = videoRef.current;
        if (!el) return;
        if (el.paused) el.play();
        else el.pause();
      }

      if (e.key === '/') {
        commentInputRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTypingComment, mediaControllerEl, videoRef]);

  // Refs
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Derived
  const idleOffset = controlBarHeight - 2 + timeRangeBarHeight / 2;

  // Placeholder reserves layout so theres no shift when the player swaps in
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
      className={cn(
        styles.player,
        isIdle && 'in-fullscreen:cursor-none',
        'sm:rounded-md',
      )}
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
        onPointerUp={(e) => {
          if (e.pointerType !== 'touch') return; // let media-chrome native click-to-toggle handle mouse

          if (isIdle) {
            resetIdleTimer(isTypingComment);
          } else {
            setIsIdle(true);
          }
        }}
      />

      <div className='md:hidden'>
        <MobileCommentMarker videoRef={videoRef} />
      </div>

      <div
        className={cn(
          'w-full flex md:flex-col',
          'transition-opacity duration-300 md:transition-transform',
          isIdle && !isPaused && 'md:translate-y-(--idle-offset)',
          isIdle && !isPaused && 'max-md:opacity-0 max-md:pointer-events-none',
        )}
        style={{ '--idle-offset': `${idleOffset}px` } as React.CSSProperties}
      >
        <MediaControlBar
          ref={setTimeRangeBarEl}
          className={cn(styles.timeRangeBar, 'w-full')}
        >
          <div className={styles.timeline}>
            <div className={cn(styles.commentStrip, 'hidden md:flex')}>
              <CommentMarkers videoRef={videoRef} isHydrated={isHydrated} />
            </div>
            <MediaTimeRange />
          </div>
        </MediaControlBar>

        {/* Mobile only controls */}
        <div className='md:hidden transition-all'>
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <MediaPlayButton
              className={cn(styles.centerPlayButton, 'pointer-events-auto')}
            />
          </div>
          <div className='absolute top-2 left-2 flex'>
            <MediaTimeDisplay showDuration />
          </div>
          <div className='absolute top-2 right-2 flex'>
            <MediaFullscreenButton />
          </div>
        </div>

        <MediaControlBar
          ref={setControlBarEl}
          className={cn(styles.controlBar, 'gap-1 sm:gap-4 md:gap-12')}
        >
          <div className='flex gap-1'>
            <MediaPlayButton className='hidden md:flex' />
            <MediaTimeDisplay showDuration className='hidden md:flex' />
            <div className={cn(styles.volumeControls, 'hidden md:flex')}>
              <MediaMuteButton />
              <MediaVolumeRange />
            </div>
          </div>

          <div className='hidden lg:flex w-1/2'>
            <VideoCommentInput
              ref={commentInputRef}
              videoId={videoId}
              videoRef={videoRef}
              currentTime={currentTime}
              resetIdleTimer={resetIdleTimer}
              onTypingChange={setIsTypingComment}
            />
          </div>

          <div className='space-x-2 hidden md:flex'>
            <MediaFullscreenButton />
          </div>
        </MediaControlBar>
      </div>
    </MediaController>
  );
}
