import { ComponentRef, forwardRef, useState } from 'react';
import type MuxVideo from '@mux/mux-video-react';

import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { formatTimestamp } from '@/lib/format-timestamp';
import { usePostComment } from '@/hooks/use-post-comment';
import { useComments } from '@/contexts/comments-context';
import { Button } from '../ui/button';
import { Loader2, Send, X } from 'lucide-react';

type VideoCommentInputProps = {
  videoId: string;
  videoRef: React.RefObject<ComponentRef<typeof MuxVideo> | null>;
  currentTime: number;
  resetIdleTimer: (skipSchedule?: boolean) => void;
  onTypingChange: (isTyping: boolean) => void;
};

const VideoCommentInput = forwardRef<HTMLInputElement, VideoCommentInputProps>(
  function VideoCommentInput(
    { videoId, videoRef, currentTime, resetIdleTimer, onTypingChange },
    ref,
  ) {
    const { handleAddComment, draftTimestamp, setDraftTimestamp } =
      useComments();

    const { submit, isSubmitting, error } = usePostComment(
      videoId,
      handleAddComment,
    );

    const [content, setContent] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const blurInput = () => {
      if (typeof ref === 'function') return;
      ref?.current?.blur();
    };

    const handleSubmit = async () => {
      if (content.trim().length <= 0) blurInput();
      const ok = await submit(content, draftTimestamp);
      if (ok) {
        setContent('');
        onTypingChange(false);
        resetIdleTimer();
        blurInput();
      }
    };

    return (
      <div className='relative w-1/2'>
        <Input
          ref={ref}
          className={cn(
            'w-full rounded-full border-none bg-[#1b1b1d99]',
            'text-sm px-4 placeholder:text-white',
          )}
          placeholder={
            draftTimestamp !== null
              ? `Comment at ${formatTimestamp(draftTimestamp)}`
              : 'Comment'
          }
          value={content}
          onClick={(e) => e.stopPropagation()}
          onFocus={() => {
            setIsFocused(true);
            onTypingChange(true);
            resetIdleTimer(true);
            setDraftTimestamp(videoRef.current?.currentTime ?? 0);
          }}
          onBlur={() => {
            setIsFocused(false);
            onTypingChange(false);
            resetIdleTimer();
            setDraftTimestamp(null);
          }}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') {
              setContent('');
              blurInput();
            }
          }}
        />
        {content === '' && !isFocused && (
          <div className='absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white pointer-events-none flex items-center gap-2'>
            Comment at {formatTimestamp(currentTime)}{' '}
            <span className='px-1 text-xs rounded border border-white/20 bg-white/5'>
              /
            </span>
          </div>
        )}

        <div className='absolute right-1 top-1/2 -translate-y-1/2 flex justify-center items-center'>
          <Button
            className={cn(
              'cursor-pointer text-white/50',
              content.trim().length > 0 && 'text-white',
              'hover:text-white/50',
            )}
            variant={null}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className='w-4 h-4 animate-spin animation-duration-[2s]' />
            ) : (
              <Send className='w-4 h-4' />
            )}
          </Button>
        </div>
      </div>
    );
  },
);

export default VideoCommentInput;
