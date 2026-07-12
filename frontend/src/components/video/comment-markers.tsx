import {
  ComponentRef,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import MuxVideo from '@mux/mux-video-react';

import type { Comment } from '@/lib/api/comments';
import { useVideoTime } from '@/hooks/use-video-time';
import { useActiveComment } from '@/hooks/use-active-comment';

import { CommentMarker } from './comment-marker';
import { useCommentClusters } from '@/hooks/use-comment-clusters';

type CommentMarkersProps = {
  comments: Comment[];
  videoRef: RefObject<ComponentRef<typeof MuxVideo> | null>;
};

export default function CommentMarkers({
  comments,
  videoRef,
}: CommentMarkersProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [stripWidthPx, setStripWidthPx] = useState<number | null>(null);

  const timestampedComments = useMemo(
    () => comments.filter((c) => c.timestampSeconds !== null),
    [comments],
  );

  const { duration } = useVideoTime(videoRef);
  const activeId = useActiveComment(videoRef, timestampedComments);
  const commentClusters = useCommentClusters(
    timestampedComments,
    stripWidthPx,
    duration,
  );

  // Measure the strip width and observe resize
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    setStripWidthPx(el.offsetWidth); // initial sync measure

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setStripWidthPx(entry.contentRect.width);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={stripRef} className='absolute inset-0'>
      {commentClusters.map((cluster) => (
        <CommentMarker
          key={cluster.id}
          commentCluster={cluster}
          isActive={cluster.comments.some((c) => c.id === activeId)}
        />
      ))}
    </div>
  );
}
