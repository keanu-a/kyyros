import { apiFetch } from './fetcher';

type UserSummary = {
  id: string;
  username: string;
  profilePictureUrl: string;
};

type Comment = {
  id: string;
  content: string;
  timestampSeconds: number;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
  user: UserSummary;
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
