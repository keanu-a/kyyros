'use client';

import MuxVideo from '@mux/mux-video-react';

type VideoPlayerProps = {
  playbackId: string | null;
  title: string;
};

export default function VideoPlayer({ playbackId, title }: VideoPlayerProps) {
  return (
    <div>
      <MuxVideo
        playbackId={playbackId ?? undefined}
        title={title}
        style={{ width: '100%', aspectRatio: '16/9' }}
        controls
      />
      <h1>Video Player</h1>
    </div>
  );
}
