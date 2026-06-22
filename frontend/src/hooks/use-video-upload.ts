import {
  type ContentType,
  createVideo,
  getVideo,
  updateVideoStatus,
  VideoStatus,
} from '@/lib/api/videos';
import { uploadToS3 } from '@/lib/upload/s3';
import { useCallback, useEffect, useRef, useState } from 'react';

export const UploadStatus = {
  IDLE: 'idle',
  CREATING: 'creating',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
} as const;

export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

interface UploadMetadata {
  title: string;
  description?: string;
  contentType: ContentType;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150; // ~5 min at 2s

export function useVideoUpload() {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
    UploadStatus.IDLE,
  );
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    },
    [],
  );

  // Poll for video processing status to be `READY` or `FAILED`
  const pollUntilReady = useCallback((videoId: string) => {
    // Clear any existing interval before starting a new one
    if (pollRef.current) clearInterval(pollRef.current);

    let attempts = 0; // Bound the number of attempts

    pollRef.current = setInterval(async () => {
      // Setting ERROR if Mux outage or webhook failure
      if (++attempts > MAX_POLL_ATTEMPTS) {
        clearInterval(pollRef.current!);
        setError('Processing timed out. Please try again.');
        setUploadStatus(UploadStatus.ERROR);
        return;
      }

      try {
        const video = await getVideo(videoId);
        if (video.status === VideoStatus.READY) {
          clearInterval(pollRef.current!);
          setPlaybackId(video.playbackId);
          setUploadStatus(UploadStatus.READY);
        } else if (video.status === VideoStatus.FAILED) {
          clearInterval(pollRef.current!);
          setError('Error occurred while processing video');
          setUploadStatus(UploadStatus.ERROR);
        }
      } catch (e) {
        clearInterval(pollRef.current!);
        setError('Error occurred while polling video status');
        setUploadStatus(UploadStatus.ERROR);
      }
    }, POLL_INTERVAL_MS);
  }, []);

  const upload = useCallback(
    async (file: File, metadata: UploadMetadata) => {
      setError(null);
      setProgress(0);

      try {
        // Initiate upload and get presigned PUT url
        setUploadStatus(UploadStatus.CREATING);
        const { videoId, presignedUrl } = await createVideo({
          title: metadata.title,
          description: metadata.description,
          fileName: file.name,
          contentType: metadata.contentType,
        });

        // Upload the file to S3
        setUploadStatus(UploadStatus.UPLOADING);
        await uploadToS3(presignedUrl, file, setProgress);

        // Update video status for Mux
        await updateVideoStatus(videoId, VideoStatus.UPLOADED);
        setUploadStatus(UploadStatus.PROCESSING);

        // Poll for video processing status `READY` set by Mux
        pollUntilReady(videoId);
      } catch (e) {
        setError('Error occurred while uploading video');
        setUploadStatus(UploadStatus.ERROR);
      }
    },
    [pollUntilReady],
  );

  return { uploadStatus, progress, error, playbackId, upload };
}
