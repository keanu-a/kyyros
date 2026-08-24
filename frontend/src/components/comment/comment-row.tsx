import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { EllipsisIcon, Loader2, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { deleteComment, type Comment } from '@/lib/api/comments';
import { formatTimestamp } from '@/lib/format-timestamp';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/user-context';
import { useComments } from '@/contexts/comments-context';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import ConfirmDialog from '../confirm-dialog';

const AVATAR_SIZE = 24;

type CommentRowProps = {
  comment: Comment;
  onSeek: (timestampSeconds: number) => void;
  isSelected?: boolean;
};

export function CommentRow({ comment, onSeek, isSelected }: CommentRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, isAuthenticated } = useUser();

  const { handleDeleteComment } = useComments();

  const handleConfirmDeleteComment = async () => {
    setIsDeleting(true);
    try {
      await deleteComment(comment.id);
      handleDeleteComment(comment.id);
      setIsDialogOpen(false);
      toast.success('Comment deleted successfully.', {
        position: 'top-center',
      });
    } catch (error) {
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
      <Avatar
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        aria-label={`Comment by ${comment.user.username}`}
      >
        <AvatarImage
          src={comment.user.profilePictureUrl ?? undefined}
          alt={comment.user.username}
        />
        <AvatarFallback className='text-xs text-background bg-foreground'>
          {comment.user.username?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className='flex flex-col w-full'>
        <div className='flex justify-between'>
          <div className='flex flex-col lg:gap-2 lg:flex-row'>
            <h1 className='font-bold'>{comment.user.username}</h1>
            <div className='space-x-1'>
              {comment.timestampSeconds !== null && (
                <span
                  className='text-sm text-muted-foreground hover:underline cursor-pointer'
                  onClick={() => onSeek(comment.timestampSeconds ?? 0)}
                >
                  {formatTimestamp(comment.timestampSeconds)}
                </span>
              )}
              <span
                className={cn(
                  comment.timestampSeconds !== null ? '' : 'hidden lg:inline',
                )}
              >
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
                    Delete Comment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ConfirmDialog
                title='Delete Comment'
                onConfirm={handleConfirmDeleteComment}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                isPending={isDeleting}
                countdownSeconds={3}
              />
            </div>
          )}
        </div>

        <p className='whitespace-pre-wrap'>{comment.content}</p>

        {/* TODO: Add like and reply comment feature */}
        {/* <div className='flex space-x-6 *:mt-4 text-muted-foreground'>
          <Button variant='link' className='p-0 mt-2 cursor-pointer'>
            Like
          </Button>
          <Button variant='link' className='p-0 mt-2 cursor-pointer'>
            Reply
          </Button>
        </div> */}
      </div>
    </div>
  );
}
