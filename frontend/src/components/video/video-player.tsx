'use client';

import { ComponentRef, useRef, useState } from 'react';
import MuxVideo from '@mux/mux-video-react';
import {
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from 'media-chrome/react';

import CommentMarkers from './comment-markers';

import { useIsHydrated } from '@/hooks/use-is-hydrated';
import { createComment, type Comment } from '@/lib/api/comments';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import styles from './video-player.module.css';

type VideoPlayerProps = {
  playbackId: string | null;
  videoId: string;
  title: string;
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
};

export default function VideoPlayer({
  playbackId,
  videoId,
  title,
  comments,
  onAddComment,
}: VideoPlayerProps) {
  const [isAutoHideEnabled, setIsAutoHideEnabled] = useState<boolean>(false);
  const [isTypingComment, setIsTypingComment] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [content, setContent] = useState('');

  const videoRef = useRef<ComponentRef<typeof MuxVideo>>(null);
  const isHydrated = useIsHydrated();

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    // Check session
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      // TODO: Create better UX for non-logged in users
      alert('Log in to comment');
      return;
    }

    const el = videoRef.current;
    const timestampSeconds = el ? el.currentTime : 0;

    setIsSubmitting(true);
    try {
      const newComment = await createComment(videoId, {
        content: trimmed,
        timestampSeconds,
      });
      onAddComment(newComment);
      setContent('');
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Placeholder reserves layout so theres no shift when the player swaps i
  if (!isHydrated) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: '#000',
          backgroundImage: `url(https://image.mux.com/${playbackId}/thumbnail.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }

  return (
    <MediaController
      className={styles.player}
      autohide={isAutoHideEnabled ? '2' : '-1'}
      noHotkeys={isTypingComment || undefined}
    >
      <MuxVideo
        ref={videoRef}
        slot='media'
        playbackId={playbackId ?? undefined}
        metadata={{ title }}
        crossOrigin=''
        playsInline
        style={{ width: '100%', height: '100%' }}
      />

      <MediaControlBar className={styles.timeRangeBar}>
        <div className={styles.timeline}>
          <div className={styles.commentStrip}>
            <CommentMarkers comments={comments} videoRef={videoRef} />
          </div>
          <MediaTimeRange />
        </div>
      </MediaControlBar>

      <MediaControlBar className={styles.controlBar}>
        <div className={styles.leftControls}>
          <MediaPlayButton />
          <MediaTimeDisplay showDuration />
          <div className={styles.volumeControls}>
            <MediaMuteButton />
            <MediaVolumeRange />
          </div>
        </div>

        <Input
          className={cn(styles.commentInput, 'text-sm px-4')}
          placeholder='Comment...'
          value={content}
          onFocus={() => setIsTypingComment(true)}
          onBlur={() => setIsTypingComment(false)}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />

        <div className='flex space-x-2'>
          <Button
            className={styles.autoHideBtn}
            onClick={() => setIsAutoHideEnabled((prev) => !prev)}
          >
            Hide
          </Button>
          <MediaFullscreenButton />
        </div>
      </MediaControlBar>
    </MediaController>
  );
}
