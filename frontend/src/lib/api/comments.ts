import { apiFetch } from './fetcher';
import type { UserSummary } from '@/types/user';

export type Comment = {
  id: string;
  content: string;
  timestampSeconds: number | null;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
  user: UserSummary;
};

export type CreateCommentRequest = {
  content: string;
  timestampSeconds: number | null;
};

export function getComments(videoId: string): Promise<Comment[]> {
  return apiFetch(
    `/api/v1/videos/${videoId}/comments`,
    {
      method: 'GET',
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
