'use client';

import { ComponentRef, useRef } from 'react';
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

import styles from './video-player.module.css';
import CommentMarkers from './comment-markers';

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
    <MediaController className={styles.player}>
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
        <MediaFullscreenButton />
      </MediaControlBar>
    </MediaController>
  );
}
