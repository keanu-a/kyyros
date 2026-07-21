import type MuxVideo from '@mux/mux-video-react';
import { ComponentRef, RefObject, useEffect, useState } from 'react';

export function useVideoPauseState(
  isHydrated: boolean,
  videoRef: RefObject<ComponentRef<typeof MuxVideo> | null>,
) {
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

  return {
    isPaused,
  };
}
