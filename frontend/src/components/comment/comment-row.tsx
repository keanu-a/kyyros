import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { EllipsisIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { deleteComment, type Comment } from '@/lib/api/comments';
import { NotFoundError } from '@/lib/api/errors';
import { formatTimestamp } from '@/lib/format-timestamp';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/user-context';
import { useComments } from '@/contexts/comments-context';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import ConfirmDialog from '../confirm-dialog';
import UserAvatar from '../user-avatar';
import CommentLikeButton from './comment-like-button';

type CommentRowProps = {
  comment: Comment;
  onSeek: (timestampSeconds: number) => void;
  onReply: (comment: Comment) => void;
  isReply?: boolean;
  isSelected?: boolean;
};

export function CommentRow({
  comment,
  onSeek,
  onReply,
  isReply = false,
  isSelected,
}: CommentRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, isAuthenticated } = useUser();

  const { handleDeleteComment } = useComments();

  const label = isReply ? 'Reply' : 'Comment';
  // Replies inherit the root's timestamp, which the root already shows
  // A local const (not a property access) so the null check narrows it to number in the JSX below
  const timestamp = isReply ? null : comment.timestampSeconds;
  const showTimestamp = timestamp !== null;

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      toast.error('Log in to reply', {
        position: 'top-center',
      });
      return;
    }
    onReply(comment);
  };

  const handleConfirmDeleteComment = async () => {
    setIsDeleting(true);
    try {
      await deleteComment(comment.id);
      handleDeleteComment(comment.id);
      setIsDialogOpen(false);
      toast.success(`${label} deleted successfully.`, {
        position: 'top-center',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        // Already gone (e.g. deleted in another tab, or its root was deleted)
        handleDeleteComment(comment.id);
        setIsDialogOpen(false);
        toast.success(`${label} deleted successfully.`, {
          position: 'top-center',
        });
        return;
      }
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment. Please try again later.', {
        position: 'top-center',
      });
      setIsDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        isSelected && 'animate-[flash-highlight_4s_ease-out]',
        'flex space-x-2 px-2 py-4 rounded-md',
      )}
    >
      <UserAvatar
        name={comment.user.username}
        avatarUrl={comment.user.profilePictureUrl ?? undefined}
      />

      <div className='flex flex-col w-full'>
        <div className='flex justify-between'>
          <div className='flex flex-col lg:gap-2 lg:flex-row'>
            <h1 className='font-bold'>{comment.user.username}</h1>
            <div className='space-x-1'>
              {timestamp !== null && (
                <span
                  className='text-sm text-muted-foreground hover:underline cursor-pointer'
                  onClick={() => onSeek(timestamp)}
                >
                  {formatTimestamp(timestamp)}
                </span>
              )}
              <span className={cn(showTimestamp ? '' : 'hidden lg:inline')}>
                &middot;
              </span>
              <span className='text-sm text-muted-foreground'>
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {isAuthenticated && user?.id === comment.user.id && (
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger className='cursor-pointer'>
                  <EllipsisIcon size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-fit'>
                  <DropdownMenuItem
                    variant='destructive'
                    className='cursor-pointer items-center gap-1 text-nowrap'
                    onSelect={() => setIsDialogOpen(true)}
                  >
                    <Trash2Icon size={16} className='shrink-0' />
                    Delete {label}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ConfirmDialog
                title={`Delete ${label}`}
                onConfirm={handleConfirmDeleteComment}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                isPending={isDeleting}
                countdownSeconds={3}
              />
            </div>
          )}
        </div>

        <p className='whitespace-pre-wrap mt-1'>{comment.content}</p>

        <div className='mt-2 flex items-center space-x-6'>
          <CommentLikeButton comment={comment} />

          <Button
            variant='ghost'
            size='sm'
            className='h-6 cursor-pointer px-2 py-1 text-muted-foreground rounded-full'
            onClick={handleReplyClick}
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
