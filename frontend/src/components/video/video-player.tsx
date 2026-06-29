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

import type { Comment } from '@/lib/api/comments';
import { useIsHydrated } from '@/hooks/use-is-hydrated';

import { Button } from '../ui/button';
import styles from './video-player.module.css';
import CommentMarkers from './comment-markers';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

type VideoPlayerProps = {
  playbackId: string | null;
  title: string;
  comments: Comment[];
};

export default function VideoPlayer({
  playbackId,
  title,
  comments,
}: VideoPlayerProps) {
  const [isAutoHideEnabled, setIsAutoHideEnabled] = useState<boolean>(false);
  const [isTypingComment, setIsTypingComment] = useState<boolean>(false);

  const videoRef = useRef<ComponentRef<typeof MuxVideo>>(null);
  const isHydrated = useIsHydrated();

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
      className={styles.player}
      autohide={isAutoHideEnabled ? '2' : '-1'}
      noHotkeys={isTypingComment || undefined}
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

      <MediaControlBar className={styles.timeRangeBar}>
        <div className={styles.timeline}>
          <div className={styles.commentStrip}>
            <CommentMarkers comments={comments} videoRef={videoRef} />
          </div>
          <MediaTimeRange />
        </div>
      </MediaControlBar>

      <MediaControlBar className={styles.controlBar}>
        <div className={styles.leftControls}>
          <MediaPlayButton />
          <MediaTimeDisplay showDuration />
          <div className={styles.volumeControls}>
            <MediaMuteButton />
            <MediaVolumeRange />
          </div>
        </div>

        <Input
          className={cn(styles.commentInput, 'text-sm px-4')}
          placeholder='Stamp a comment...'
          onFocus={() => setIsTypingComment(true)}
          onBlur={() => setIsTypingComment(false)}
        />

        <div className='flex space-x-2'>
          <Button
            className={styles.autoHideBtn}
            onClick={() => setIsAutoHideEnabled((prev) => !prev)}
          >
            Hide
          </Button>
          <MediaFullscreenButton />
        </div>
      </MediaControlBar>
    </MediaController>
  );
}
