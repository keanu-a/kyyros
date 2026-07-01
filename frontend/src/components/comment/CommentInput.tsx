import { useRef, useState } from 'react';
import { X } from 'lucide-react';

import { usePostComment } from '@/hooks/use-post-comment';
import type { Comment } from '@/lib/api/comments';

import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

type CommentInputProps = {
  videoId: string;
  onAddComment: (comment: Comment) => void;
};

export default function CommentInput({
  videoId,
  onAddComment,
}: CommentInputProps) {
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
        className='resize-none overflow-hidden pb-14 min-h-[70px]'
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className='absolute bottom-2 left-2 flex space-x-2'>
        <Button
          className='cursor-pointer'
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim().length}
        >
          Comment
        </Button>
        {content.trim().length > 0 && (
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
