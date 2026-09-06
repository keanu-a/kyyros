import { useRef, useState } from 'react';
import { Send, X } from 'lucide-react';

import { usePostComment } from '@/hooks/use-post-comment';
import type { Comment } from '@/lib/api/comments';

import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useIsMobile } from '@/hooks/use-is-mobile';

type CommentInputProps = {
  videoId: string;
  onAddComment: (comment: Comment) => void;
};

export default function CommentInput({
  videoId,
  onAddComment,
}: CommentInputProps) {
  const isMobile = useIsMobile();
  const [content, setContent] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { submit, isSubmitting } = usePostComment(videoId, onAddComment);

  const fitTextareaToContent = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto'; // reset height
      el.style.height = `${el.scrollHeight}px`; // grow to fit content
    }
  };

  const handleSubmit = async () => {
    const ok = await submit(content, null);
    if (ok) {
      setContent('');
      fitTextareaToContent();
    }
  };

  const handleCancelComment = () => {
    setContent('');
    fitTextareaToContent();
  };

  // Tracks textarea content and resizes to fit content over buttons
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    fitTextareaToContent();
  };

  return (
    <div className='relative w-full'>
      <Textarea
        ref={textareaRef}
        value={content}
        placeholder='Comment...'
        onChange={handleContentChange}
        className='resize-none overflow-hidden min-h-17.5 pr-14 md:pb-14'
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className='absolute right-2 top-2 flex md:space-x-2 md:left-2 md:bottom-2 md:top-auto'>
        <Button
          className='cursor-pointer rounded-full md:rounded-md'
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim().length}
        >
          {isMobile ? <Send /> : 'Comment'}
        </Button>
        {content.trim().length > 0 && !isMobile && (
          <Button
            variant='outline'
            className='cursor-pointer p-1.5'
            onClick={handleCancelComment}
            disabled={isSubmitting}
          >
            <X className='w-2 h-2' />
          </Button>
        )}
      </div>
    </div>
  );
}
