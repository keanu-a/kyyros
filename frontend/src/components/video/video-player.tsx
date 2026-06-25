'use client';

import MuxVideo from '@mux/mux-video-react';
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from 'media-chrome/react';

import { useIsHydrated } from '@/hooks/use-is-hydrated';

type VideoPlayerProps = {
  playbackId: string | null;
  title: string;
};

export default function VideoPlayer({ playbackId, title }: VideoPlayerProps) {
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
    <MediaController style={{ width: '100%', aspectRatio: '16/9' }}>
      <MuxVideo
        slot="media"
        playbackId={playbackId ?? undefined}
        metadata={{ title }}
        crossOrigin=""
        playsInline
        style={{ width: '100%', height: '100%' }}
      />
      <MediaControlBar>
        <MediaPlayButton />
        <MediaSeekBackwardButton seekOffset={10} />
        <MediaSeekForwardButton seekOffset={10} />
        <MediaTimeRange />
        <MediaTimeDisplay showDuration />
        <MediaMuteButton />
        <MediaVolumeRange />
        <MediaFullscreenButton />
      </MediaControlBar>
    </MediaController>
  );
}
