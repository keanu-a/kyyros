import type { Comment } from '@/lib/api/comments';
import { CommentMarker } from './comment-marker';
import { getTimelinePosition } from './timeline-position';

type CommentMarkersProps = {
  comments: Comment[];
  duration: number | null;
  onSeek: (seconds: number) => void;
};

export default function CommentMarkers({
  comments,
  duration,
  onSeek,
}: CommentMarkersProps) {
  if (!duration) return null;

  return (
    <>
      {comments.map((comment) => {
        const position = getTimelinePosition(
          comment.timestampSeconds,
          duration,
        );
        if (!position) return null;

        return (
          <CommentMarker
            key={comment.id}
            comment={comment}
            position={position}
            onSeek={onSeek}
          />
        );
      })}
    </>
  );
}
