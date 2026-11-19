import { useEffect, useRef, useState } from 'react';

import { usePostReply } from '@/hooks/use-post-reply';

import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

type ReplyInputProps = {
  rootCommentId: string;
  // e.g. '@username ' when replying to a reply. Remount with a new key to change it.
  initialContent?: string;
  onCancel: () => void;
  onSubmitted: () => void;
};

export default function ReplyInput({
  rootCommentId,
  initialContent = '',
  onCancel,
  onSubmitted,
}: ReplyInputProps) {
  const [content, setContent] = useState<string>(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { submit, isSubmitting } = usePostReply(rootCommentId);

  const fitTextareaToContent = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto'; // reset height
      el.style.height = `${el.scrollHeight}px`; // grow to fit content
    }
  };

  // Focus on open with the caret after any prefilled @mention
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${el.scrollHeight}px`;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const handleSubmit = async () => {
    const ok = await submit(content);
    if (ok) {
      setContent('');
      onSubmitted();
    }
  };

  // Tracks textarea content and resizes to fit content
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    fitTextareaToContent();
  };

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Textarea
        ref={textareaRef}
        value={content}
        placeholder='Reply...'
        onChange={handleContentChange}
        className='resize-none overflow-hidden min-h-10'
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          } else if (e.key === 'Escape' && !isSubmitting) {
            onCancel();
          }
        }}
      />
      <div className='flex justify-end space-x-2'>
        <Button
          variant='ghost'
          size='sm'
          className='cursor-pointer'
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          size='sm'
          className='cursor-pointer'
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim().length}
        >
          Reply
        </Button>
      </div>
    </div>
  );
}
