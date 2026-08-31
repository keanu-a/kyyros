import { ComponentRef, RefObject } from 'react';

import MuxVideo from '@mux/mux-video-react';

import { getTimelinePosition } from '@/lib/getTimelinePosition';
import { useVideoTime } from '@/hooks/use-video-time';
import { useActiveComment } from '@/hooks/use-active-comment';
import { useComments } from '@/contexts/comments-context';

import { CommentMarker } from './comment-marker';

type CommentMarkersProps = {
  videoRef: RefObject<ComponentRef<typeof MuxVideo> | null>;
  isHydrated: boolean;
};

export default function CommentMarkers({
  videoRef,
  isHydrated,
}: CommentMarkersProps) {
  const { duration } = useVideoTime(videoRef, isHydrated);
  const { timestampedComments, openCommentSidebarAt, draftTimestamp } =
    useComments();

  const activeId = useActiveComment(videoRef, timestampedComments);

  const draftPosition =
    draftTimestamp !== null
      ? getTimelinePosition(draftTimestamp, duration)
      : null;

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

      {draftPosition !== null && (
        <div
          className='absolute bottom-3 w-6 h-6 rounded-full border-2 border-dashed border-brand animate-spin animation-duration-[3s]'
          style={{ left: `clamp(0px, ${draftPosition}%, calc(100% - 24px))` }}
        />
      )}
    </>
  );
}
