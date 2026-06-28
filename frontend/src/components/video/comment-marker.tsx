import { memo } from 'react';
import Image from 'next/image';

import { Button } from '../ui/button';
import type { Comment } from '@/lib/api/comments';

import styles from './comment-marker.module.css';

type CommentMarkerProps = {
  comment: Comment;
  position: number;
  onSeek: (seconds: number) => void;
};

function CommentMarkerComponent({
  comment,
  position,
  onSeek,
}: CommentMarkerProps) {
  const handleOnClick = () => {
    console.log(comment.timestampSeconds);
    onSeek(comment.timestampSeconds);
  };

  return (
    <Button
      className={styles.marker}
      style={{ left: `${position}%` }}
      aria-label={`Jump to comment by ${comment.user.username}`}
      onClick={handleOnClick}
    >
      <Image
        src={'/default-profile-picture.svg'}
        alt={comment.user.username}
        width={24}
        height={24}
        className={styles.avatar}
      />
    </Button>
  );
}

export const CommentMarker = memo(CommentMarkerComponent);
