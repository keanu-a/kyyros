'use client';

import { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';

import { GetVideoResponse } from '@/lib/api/videos';
import type { Comment } from '@/lib/api/comments';

import VideoPlayer from './video-player';
import { CommentRow } from '../comment/CommentRow';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
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
  const [content, setContent] = useState<string>('');

  const addComment = (newComment: Comment) => {
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <div>
      <div className='w-full md:w-3/4'>
        <VideoPlayer
          playbackId={video.playbackId}
          videoId={video.id}
          title={video.title}
          comments={comments}
          onAddComment={addComment}
        />
      </div>

      <div className='px-4 mt-4'>
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
        <div>
          <h2 className='font-semibold mb-4'>Comments</h2>

          <div className='mb-8 flex flex-col space-y-2'>
            <Textarea
              value={content}
              placeholder='Comment...'
              onChange={(e) => setContent(e.target.value)}
              className='resize-none'
            />
            <div className='flex space-x-4 max-w-10 items-center'>
              <Image
                src='/default-profile-picture.svg'
                alt='test user'
                width={24}
                height={24}
                className='rounded-full w-auto h-auto'
              />
              <Button className='cursor-pointer'>Comment</Button>
            </div>
          </div>

          {!comments.length ? (
            <p className='text-sm text-muted-foreground'>No comments yet</p>
          ) : (
            <ul className='flex flex-col space-y-8'>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <CommentRow comment={comment} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
