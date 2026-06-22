import { apiFetch } from './fetcher';

export const VideoStatus = {
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;

export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

export type ContentType =
  | 'video/mp4'
  | 'video/quicktime'
  | 'video/webm'
  | 'video/x-matroska'
  | 'video/x-msvideo';

export interface CreateVideoRequest {
  title: string;
  description?: string;
  fileName: string;
  contentType: ContentType;
}

export interface CreateVideoResponse {
  videoId: string;
  presignedUrl: string;
  s3Key: string;
}

export interface GetVideoResponse {
  id: string;
  title: string;
  status: VideoStatus;
  playbackId: string;
  createdAt: string;
}

export function createVideo(
  request: CreateVideoRequest,
): Promise<CreateVideoResponse> {
  return apiFetch('/api/v1/videos', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updateVideoStatus(
  id: string,
  status: VideoStatus,
): Promise<void> {
  return apiFetch(`/api/v1/videos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getVideo(id: string): Promise<GetVideoResponse> {
  return apiFetch(`/api/v1/videos/${id}`, {
    method: 'GET',
  });
}
