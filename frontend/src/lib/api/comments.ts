import { apiFetch } from './fetcher';
import type { LikeStatusResponse } from './videos';
import type { UserSummary } from '@/types/user';

export type Comment = {
  id: string;
  content: string;
  timestampSeconds: number | null;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByMe: boolean;
  replies: Comment[];
  user: UserSummary;
};

export type CreateCommentRequest = {
  content: string;
  timestampSeconds: number | null;
};

export type CreateReplyRequest = {
  content: string;
};

// accessToken lets the RSC fetch include likedByMe, since apiFetch has no session on the server
export function getComments(
  videoId: string,
  accessToken?: string,
): Promise<Comment[]> {
  return apiFetch(
    `/api/v1/videos/${videoId}/comments`,
    {
      method: 'GET',
      ...(accessToken && {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    },
    {
      requireAuth: false,
    },
  );
}

export function createComment(
  videoId: string,
  request: CreateCommentRequest,
): Promise<Comment> {
  return apiFetch(
    `/api/v1/videos/${videoId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    {
      requireAuth: true,
    },
  );
}

// Always pass the thread's root id; the backend flattens replies-to-replies onto the root anyway
export function createReply(
  rootCommentId: string,
  request: CreateReplyRequest,
): Promise<Comment> {
  return apiFetch(
    `/api/v1/comments/${rootCommentId}/replies`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    {
      requireAuth: true,
    },
  );
}

export function likeComment(commentId: string): Promise<LikeStatusResponse> {
  return apiFetch(
    `/api/v1/comments/${commentId}/like`,
    {
      method: 'PUT',
    },
    {
      requireAuth: true,
    },
  );
}

export function unlikeComment(commentId: string): Promise<LikeStatusResponse> {
  return apiFetch(
    `/api/v1/comments/${commentId}/like`,
    {
      method: 'DELETE',
    },
    {
      requireAuth: true,
    },
  );
}

export function deleteComment(commentId: string): Promise<void> {
  return apiFetch(
    `/api/v1/comments/${commentId}`,
    {
      method: 'DELETE',
    },
    {
      requireAuth: true,
    },
  );
}
