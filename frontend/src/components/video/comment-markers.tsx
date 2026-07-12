import { ComponentRef, RefObject, useMemo } from 'react';

import MuxVideo from '@mux/mux-video-react';

import type { Comment } from '@/lib/api/comments';
import { getTimelinePosition } from '@/lib/getTimelinePosition';
import { useVideoTime } from '@/hooks/use-video-time';
import { useActiveComment } from '@/hooks/use-active-comment';

import { CommentMarker } from './comment-marker';

type CommentMarkersProps = {
  comments: Comment[];
  videoRef: RefObject<ComponentRef<typeof MuxVideo> | null>;
};

export default function CommentMarkers({
  comments,
  videoRef,
}: CommentMarkersProps) {
  const { duration } = useVideoTime(videoRef);

  const timestampedComments = useMemo(
    () => comments.filter((c) => c.timestampSeconds !== null),
    [comments],
  );

  const activeId = useActiveComment(videoRef, timestampedComments);

  return (
    <>
      {timestampedComments.map((comment) => {
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
