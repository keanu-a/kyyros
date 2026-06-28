import { useEffect, useState, type ComponentRef, type RefObject } from 'react';
import type MuxVideo from '@mux/mux-video-react';

import type { Comment } from '@/lib/api/comments';

type MuxVideoEl = ComponentRef<typeof MuxVideo>;

// How long (seconds) a comment stays active after the playhead crosses it.
const DISPLAY_WINDOW = 3;

export function useActiveComment(
  videoRef: RefObject<MuxVideoEl | null>,
  comments: Comment[],
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const computeActive = () => {
      const t = el.currentTime;

      // Latest-wins: among comments whose window covers t,
      // pick the one with the highest timestamp.
      let active: Comment | null = null;
      for (const c of comments) {
        const inWindow =
          c.timestampSeconds <= t && t <= c.timestampSeconds + DISPLAY_WINDOW;
        if (
          inWindow &&
          (!active || c.timestampSeconds > active.timestampSeconds)
        ) {
          active = c;
        }
      }

      // No-op if unchanged, React skips re-render between transitions.
      setActiveId(active?.id ?? null);
    };

    el.addEventListener('timeupdate', computeActive);
    el.addEventListener('seeked', computeActive);

    return () => {
      el.removeEventListener('timeupdate', computeActive);
      el.removeEventListener('seeked', computeActive);
    };
  }, [videoRef, comments]);

  return activeId;
}
