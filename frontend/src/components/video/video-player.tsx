'use client';

import { ComponentRef, useRef, useState } from 'react';
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
import { useIdleState } from '@/hooks/use-idle-state';
import { useElementSize } from '@/hooks/use-element-size';
import { useVideoPauseState } from '@/hooks/use-video-pause-state';
import { useComments } from '@/contexts/comments-context';
import { formatTimestamp } from '@/lib/format-timestamp';
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
  // Context
  const { handleAddComment, draftTimestamp, setDraftTimestamp } = useComments();

  // External hooks
  const isHydrated = useIsHydrated();
  const { submit, isSubmitting, error } = usePostComment(
    videoId,
    handleAddComment,
  );

  // Component-specific hooks
  const { isIdle, setIsIdle, resetIdleTimer } = useIdleState();
  const { setEl: setTimeRangeBarEl, height: timeRangeBarHeight } =
    useElementSize<ComponentRef<typeof MediaControlBar>>();
  const { setEl: setControlBarEl, height: controlBarHeight } =
    useElementSize<ComponentRef<typeof MediaControlBar>>();
  const { isPaused } = useVideoPauseState(isHydrated, videoRef);

  // Local state
  const [isTypingComment, setIsTypingComment] = useState<boolean>(false);
  const [content, setContent] = useState('');

  // Refs
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Derived
  const idleOffset = controlBarHeight - 2 + timeRangeBarHeight / 2;

  const handleSubmit = async () => {
    const ok = await submit(content, draftTimestamp);
    if (ok) {
      setContent('');
      setIsTypingComment(false);
      resetIdleTimer();
      commentInputRef.current?.blur();
    }
  };

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
            className={cn(
              styles.commentInput,
              'text-sm px-4 placeholder:text-white',
            )}
            placeholder={
              draftTimestamp !== null
                ? `Comment at ${formatTimestamp(draftTimestamp)}`
                : 'Comment'
            }
            value={content}
            onClick={(e) => e.stopPropagation()}
            onFocus={() => {
              setIsTypingComment(true);
              resetIdleTimer(true);
              setDraftTimestamp(videoRef.current?.currentTime ?? 0);
            }}
            onBlur={() => {
              setIsTypingComment(false);
              resetIdleTimer();
              setDraftTimestamp(null);
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
