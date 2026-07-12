import { useEffect, useState, type ComponentRef, type RefObject } from 'react';
import type MuxVideo from '@mux/mux-video-react';

import type { Comment } from '@/lib/api/comments';

type MuxVideoEl = ComponentRef<typeof MuxVideo>;

const DISPLAY_WINDOW = 2;
const IDLE_LINGER_MS = 4000; // active clears ~4s after playback stops

export function useActiveComment(
  videoRef: RefObject<MuxVideoEl | null>,
  comments: Comment[],
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let clearTimer: number | null = null;

    const scheduleClear = () => {
      if (clearTimer !== null) window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(() => {
        setActiveId(null);
        clearTimer = null;
      }, IDLE_LINGER_MS);
    };

    const computeActive = () => {
      const currentTime = el.currentTime;
      let activeComment: Comment | null = null;
      let activeTimestamp = -Infinity;

      for (const comment of comments) {
        const timestamp = comment.timestampSeconds;
        if (timestamp === null) continue;

        const isInWindow =
          timestamp <= currentTime && currentTime <= timestamp + DISPLAY_WINDOW;

        if (isInWindow && timestamp > activeTimestamp) {
          activeComment = comment;
          activeTimestamp = timestamp;
        }
      }

      setActiveId(activeComment?.id ?? null);
      scheduleClear(); // resets on every playback tick; only fires when idle
    };

    el.addEventListener('timeupdate', computeActive);
    el.addEventListener('seeked', computeActive);

    computeActive(); // initial sync on mount

    return () => {
      el.removeEventListener('timeupdate', computeActive);
      el.removeEventListener('seeked', computeActive);
      if (clearTimer !== null) window.clearTimeout(clearTimer);
    };
  }, [videoRef, comments]);

  return activeId;
}
