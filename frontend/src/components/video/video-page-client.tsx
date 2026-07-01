'use client';

import { ComponentRef, useRef, useState } from 'react';
import Image from 'next/image';

import MuxVideo from '@mux/mux-video-react';
import { formatDistanceToNow } from 'date-fns';

import { GetVideoResponse } from '@/lib/api/videos';
import type { Comment } from '@/lib/api/comments';

import VideoPlayer from './video-player';
import { CommentRow } from '../comment/CommentRow';
import CommentInput from '../comment/CommentInput';

type VideoPageClientProps = {
  video: GetVideoResponse;
  comments: Comment[];
};

export default function VideoPageClient({
  video,
  comments: initialComments,
}: VideoPageClientProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const videoRef = useRef<ComponentRef<typeof MuxVideo>>(null);

  const handleAddComment = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  // Moves video playback to selected timestamp and plays video
  const seekToTimestamp = (timestampSeconds: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = timestampSeconds;
    el.play();
  };

  return (
    <div>
      <div className='w-full md:w-3/4'>
        <VideoPlayer
          playbackId={video.playbackId}
          videoId={video.id}
          title={video.title}
          comments={comments}
          onAddComment={handleAddComment}
          videoRef={videoRef}
        />
      </div>

      <div className='px-4 mt-4'>
        {/* Video Description */}
        <div>
          <h1 className='font-bold text-xl'>{video.title}</h1>
          <p className='text-sm'>
            {formatDistanceToNow(new Date(video.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>

        <br />

        {/* Comment Section */}
        <div className='w-full md:w-3/4'>
          <h2 className='font-semibold mb-4'>Comments</h2>

          <div className='mb-18 flex space-x-2 w-full'>
            <div className='flex space-x-4 max-w-10 items-center'>
              <Image
                src='/default-profile-picture.svg'
                alt='test user'
                width={24}
                height={24}
                className='rounded-full w-auto h-auto'
              />
            </div>
            <CommentInput videoId={video.id} onAddComment={handleAddComment} />
          </div>

          {!comments.length ? (
            <p className='text-sm text-muted-foreground'>No comments yet</p>
          ) : (
            <ul className='flex flex-col space-y-10'>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <CommentRow comment={comment} onSeek={seekToTimestamp} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
