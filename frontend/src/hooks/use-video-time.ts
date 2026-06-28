import {
  useCallback,
  useEffect,
  useState,
  type ComponentRef,
  type RefObject,
} from 'react';

import type MuxVideo from '@mux/mux-video-react';

type MuxVideoEl = ComponentRef<typeof MuxVideo>;

export function useVideoTime(
  videoRef: RefObject<MuxVideoEl | null>,
  enabled: boolean,
) {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (Number.isFinite(el.duration) && el.duration > 0) {
      setDuration(el.duration);
    }

    const handleDuration = () => {
      const dur = el.duration;
      setDuration(Number.isFinite(dur) && dur > 0 ? dur : null);
    };

    el.addEventListener('loadedmetadata', handleDuration);
    el.addEventListener('durationchange', handleDuration);

    return () => {
      el.removeEventListener('loadedmetadata', handleDuration);
      el.removeEventListener('durationchange', handleDuration);
    };
  }, [videoRef, enabled]);

  const seekTo = useCallback(
    (seconds: number) => {
      const el = videoRef.current;
      if (el) el.currentTime;
    },
    [videoRef],
  );

  return { duration, seekTo };
}
