import { useEffect, useState, type ComponentRef, type RefObject } from 'react';

import type MuxVideo from '@mux/mux-video-react';

type MuxVideoEl = ComponentRef<typeof MuxVideo>;

export function useVideoTime(
  videoRef: RefObject<MuxVideoEl | null>,
  isHydrated: boolean,
) {
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!isHydrated) return;

    const el = videoRef.current;
    if (!el) return;

    // Reading and setting video duration
    if (Number.isFinite(el.duration) && el.duration > 0) {
      setDuration(el.duration);
    }

    const handleDuration = () => {
      const dur = el.duration;
      setDuration(Number.isFinite(dur) && dur > 0 ? dur : null);
    };
    const handleTimeUpdate = () => {
      const rounded = Math.floor(el.currentTime);
      setCurrentTime((prev) => (prev === rounded ? prev : rounded));
    };

    el.addEventListener('loadedmetadata', handleDuration);
    el.addEventListener('durationchange', handleDuration);
    el.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      el.removeEventListener('loadedmetadata', handleDuration);
      el.removeEventListener('durationchange', handleDuration);
      el.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, isHydrated]);

  return { duration, currentTime };
}
