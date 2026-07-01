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
import { Button } from '../ui/button';

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
        {/* Video Details */}
        <div className='border rounded-lg p-4 w-full md:w-3/4'>
          {/* Title + timestamp */}
          <h1 className='font-bold text-xl mb-1'>{video.title}</h1>
          <p className='text-sm text-muted-foreground mb-4'>
            {formatDistanceToNow(new Date(video.createdAt), {
              addSuffix: true,
            })}
          </p>

          {/* Byline row */}
          <div className='flex items-center mb-4 space-x-6'>
            <div className='flex items-center gap-2'>
              <Image
                src='/default-profile-picture.svg'
                alt={video.uploader?.username ?? 'uploader'}
                width={32}
                height={32}
                className='rounded-full'
              />
              <span className='text-sm'>@{video.uploader?.username}</span>
            </div>
            <Button className='text-xs px-3 py-1.5 rounded-full'>Follow</Button>
          </div>

          {/* Description */}
          <div className='border-t pt-3'>
            <p className='whitespace-pre-wrap text-sm text-muted-foreground'>
              {video.description}
            </p>
          </div>
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
