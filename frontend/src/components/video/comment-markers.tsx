import { ComponentRef, RefObject } from 'react';

import MuxVideo from '@mux/mux-video-react';

import type { Comment } from '@/lib/api/comments';
import { useVideoTime } from '@/hooks/use-video-time';
import { useActiveComment } from '@/hooks/use-active-comment';

import { CommentMarker } from './comment-marker';
import { getTimelinePosition } from './timeline-position';

type CommentMarkersProps = {
  comments: Comment[];
  videoRef: RefObject<ComponentRef<typeof MuxVideo> | null>;
};

export default function CommentMarkers({
  comments,
  videoRef,
}: CommentMarkersProps) {
  const { duration } = useVideoTime(videoRef);
  const activeId = useActiveComment(videoRef, comments);

  if (duration === null) return null;

  return (
    <>
      {comments
        .filter((comment) => comment.timestampSeconds !== null)
        .map((comment) => {
          const position = getTimelinePosition(
            comment.timestampSeconds,
            duration,
          );
          if (position === null) return null;

          return (
            <CommentMarker
              key={comment.id}
              comment={comment}
              position={position}
              isActive={comment.id === activeId}
            />
          );
        })}
    </>
  );
}
