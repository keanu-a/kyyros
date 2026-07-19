import { ComponentRef, RefObject } from 'react';

import MuxVideo from '@mux/mux-video-react';

import { getTimelinePosition } from '@/lib/getTimelinePosition';
import { useVideoTime } from '@/hooks/use-video-time';
import { useActiveComment } from '@/hooks/use-active-comment';
import { useComments } from '@/contexts/comments-context';

import { CommentMarker } from './comment-marker';

type CommentMarkersProps = {
  videoRef: RefObject<ComponentRef<typeof MuxVideo> | null>;
};

export default function CommentMarkers({ videoRef }: CommentMarkersProps) {
  const { duration } = useVideoTime(videoRef);
  const { timestampedComments, openCommentSidebarAt } = useComments();

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
            onSelect={openCommentSidebarAt}
          />
        );
      })}
    </>
  );
}
