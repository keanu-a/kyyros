import {
  type ContentType,
  createVideo,
  getVideo,
  updateVideoStatus,
  VideoStatus,
} from '@/lib/api/videos';
import { uploadToS3 } from '@/lib/upload/s3';
import { useCallback, useEffect, useRef, useState } from 'react';

export type UploadStatus =
  | 'idle'
  | 'creating'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error';

interface UploadMetadata {
  title: string;
  description?: string;
  contentType: ContentType;
}

const POLL_INTERVAL_MS = 2000;

export function useVideoUpload() {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<UploadStatus>('idle');
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

  const pollUntilReady = useCallback((videoId: string) => {
    // Poll for video processing status to be `READY` or `FAILED`
    pollRef.current = setInterval(async () => {
      try {
        const video = await getVideo(videoId);
        if (video.status === VideoStatus.READY) {
          clearInterval(pollRef.current!);
          setPlaybackId(video.playbackId);
          setStatus('ready');
        } else if (video.status === VideoStatus.FAILED) {
          clearInterval(pollRef.current!);
          setError('Error occurred while processing video');
          setStatus('error');
        }
      } catch (e) {
        clearInterval(pollRef.current!);
        setError('Error occurred while polling video status');
        setStatus('error');
      }
    }, POLL_INTERVAL_MS);
  }, []);

  const upload = useCallback(
    async (file: File, metadata: UploadMetadata) => {
      setError(null);
      setProgress(0);

      try {
        // Initiate upload and get presigned PUT url
        setStatus('creating');
        const { videoId, presignedUrl } = await createVideo({
          title: metadata.title,
          description: metadata.description,
          fileName: file.name,
          contentType: metadata.contentType,
        });

        // Upload the file to S3
        setStatus('uploading');
        await uploadToS3(presignedUrl, file, setProgress);

        // Update video status for Mux
        await updateVideoStatus(videoId, VideoStatus.UPLOADED);
        setStatus('processing');

        // Poll for video processing status `READY` set by Mux
        pollUntilReady(videoId);
      } catch (e) {
        console.error(e); // TODO: For dev purposes only
        setError('Error occurred while uploading video');
        setStatus('error');
      }
    },
    [pollUntilReady],
  );

  return { status, progress, error, playbackId, upload };
}
