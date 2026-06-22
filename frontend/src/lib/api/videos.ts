import { apiFetch } from './fetcher';

export const VideoStatus = {
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;

export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

export const CONTENT_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
  'video/x-msvideo',
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

// Checks if provided string is a valid content type
export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}

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
  videoStatus: VideoStatus,
): Promise<void> {
  return apiFetch(`/api/v1/videos/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ videoStatus }),
  });
}

export function getVideo(id: string): Promise<GetVideoResponse> {
  return apiFetch(`/api/v1/videos/${id}`, {
    method: 'GET',
  });
}
