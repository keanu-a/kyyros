import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { Comment } from '@/lib/api/comments';

type CommentsContextType = {
  allComments: Comment[];
  handleAddComment: (newComment: Comment) => void;
  timestampedComments: Comment[];
  isSidebarOpen: boolean;
  selectedCommentId: string | null;
  seekToTimestamp: (timestampSeconds: number) => void;
  openCommentSidebarAt: (id: string) => void;
  closeCommentSidebar: () => void;
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

  const timestampedComments = useMemo(
    () =>
      allComments
        .filter((c) => c.timestampSeconds !== null)
        .sort((a, b) => (a.timestampSeconds ?? 0) - (b.timestampSeconds ?? 0)),
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

  return (
    <CommentsContext.Provider
      value={{
        allComments,
        handleAddComment,
        timestampedComments,
        isSidebarOpen,
        selectedCommentId,
        seekToTimestamp,
        openCommentSidebarAt,
        closeCommentSidebar,
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
