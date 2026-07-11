import { useEffect, useState, type ComponentRef, type RefObject } from 'react';
import type MuxVideo from '@mux/mux-video-react';

import type { Comment } from '@/lib/api/comments';

type MuxVideoEl = ComponentRef<typeof MuxVideo>;

// How long (seconds) a comment stays active after the playhead crosses it
const DISPLAY_WINDOW = 2;

export function useActiveComment(
  videoRef: RefObject<MuxVideoEl | null>,
  comments: Comment[],
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const computeActive = () => {
      const currentTime = el.currentTime;

      // Latest-wins: among comments whose window covers t,
      // pick the one with the highest timestamp.
      let activeComment: Comment | null = null;
      let activeTimestamp = -Infinity;

      for (const comment of comments) {
        const timestamp = comment.timestampSeconds;
        if (timestamp === null) continue; // Generic comments have no timestamp, so they cant be active

        const isInWindow =
          timestamp <= currentTime && currentTime <= timestamp + DISPLAY_WINDOW;

        if (isInWindow && timestamp > activeTimestamp) {
          activeComment = comment;
          activeTimestamp = timestamp;
        }
      }

      // No-op if unchanged, React skips re-render between transitions.
      setActiveId(activeComment?.id ?? null);
    };

    el.addEventListener('timeupdate', computeActive);
    el.addEventListener('seeked', computeActive);
    computeActive();

    return () => {
      el.removeEventListener('timeupdate', computeActive);
      el.removeEventListener('seeked', computeActive);
    };
  }, [videoRef, comments]);

  return activeId;
}
