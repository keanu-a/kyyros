import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { Comment } from '@/lib/api/comments';

type CommentsContextType = {
  allComments: Comment[];
  totalCommentCount: number;
  handleAddComment: (newComment: Comment) => void;
  handleAddReply: (rootCommentId: string, reply: Comment) => void;
  handleDeleteComment: (commentId: string) => void;
  setCommentLikeStatus: (
    commentId: string,
    likeCount: number,
    likedByMe: boolean,
  ) => void;
  timestampedComments: Comment[];
  isSidebarOpen: boolean;
  selectedCommentId: string | null;
  seekToTimestamp: (timestampSeconds: number) => void;
  openCommentSidebarAt: (id: string) => void;
  closeCommentSidebar: () => void;
  draftTimestamp: number | null;
  setDraftTimestamp: (timestamp: number | null) => void;
};

const CommentsContext = createContext<CommentsContextType | undefined>(
  undefined,
);

export function CommentsProvider({
  comments,
  seekToTimestamp,
  children,
}: {
  comments: Comment[];
  seekToTimestamp: (timestampSeconds: number) => void;
  children: ReactNode;
}) {
  const [allComments, setAllComments] = useState<Comment[]>(comments);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );
  const [draftTimestamp, setDraftTimestamp] = useState<number | null>(null);

  const timestampedComments = useMemo(
    () =>
      allComments
        .filter((c) => c.timestampSeconds !== null)
        .sort((a, b) => (a.timestampSeconds ?? 0) - (b.timestampSeconds ?? 0)),
    [allComments],
  );

  // Root comments plus all of their replies
  const totalCommentCount = useMemo(
    () =>
      allComments.reduce(
        (count, comment) => count + 1 + comment.replies.length,
        0,
      ),
    [allComments],
  );

  const openCommentSidebarAt = (id: string) => {
    setSelectedCommentId(id);
    setIsSidebarOpen(true);
  };

  const closeCommentSidebar = () => {
    setSelectedCommentId(null);
    setIsSidebarOpen(false);
  };

  const handleAddComment = (newComment: Comment) => {
    setAllComments((prev) => [newComment, ...prev]);
  };

  // Replies are oldest first, so a new reply goes at the end of its thread
  const handleAddReply = (rootCommentId: string, reply: Comment) => {
    setAllComments((prev) =>
      prev.map((comment) =>
        comment.id === rootCommentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment,
      ),
    );
  };

  // Handles both roots and replies. Deleting a root drops its whole thread,
  // matching the backend cascade.
  const handleDeleteComment = (commentId: string) => {
    setAllComments((prev) =>
      prev
        .filter((comment) => comment.id !== commentId)
        .map((comment) =>
          comment.replies.some((reply) => reply.id === commentId)
            ? {
                ...comment,
                replies: comment.replies.filter(
                  (reply) => reply.id !== commentId,
                ),
              }
            : comment,
        ),
    );
  };

  // Lives here (not in each row) so every row rendering the same comment stays in sync.
  // Checks replies too, so reply likes stay in sync.
  const setCommentLikeStatus = (
    commentId: string,
    likeCount: number,
    likedByMe: boolean,
  ) => {
    const applyLike = (comment: Comment): Comment =>
      comment.id === commentId ? { ...comment, likeCount, likedByMe } : comment;

    setAllComments((prev) =>
      prev.map((comment) => ({
        ...applyLike(comment),
        replies: comment.replies.map(applyLike),
      })),
    );
  };

  return (
    <CommentsContext.Provider
      value={{
        allComments,
        totalCommentCount,
        handleAddComment,
        handleAddReply,
        handleDeleteComment,
        setCommentLikeStatus,
        timestampedComments,
        isSidebarOpen,
        selectedCommentId,
        seekToTimestamp,
        openCommentSidebarAt,
        closeCommentSidebar,
        draftTimestamp,
        setDraftTimestamp,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentsContext);
  if (!context)
    throw new Error('useComments must be used within a CommentsProvider');
  return context;
}
