import { notFound } from 'next/navigation';

import VideoPlayer from '@/components/video/video-player';
import { Comment } from '@/components/comment/Comment';

import { getVideo } from '@/lib/api/videos';
import { getComments } from '@/lib/api/comments';
import { formatDistanceToNow } from 'date-fns';

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [video, comments] = await Promise.all([getVideo(id), getComments(id)]);
  if (!video) notFound();

  return (
    <main>
      <div className='w-full md:w-3/4'>
        <VideoPlayer
          playbackId={video.playbackId}
          title={video.title}
          comments={comments}
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
          {!comments.length ? (
            <p className='text-sm text-muted-foreground'>No comments yet</p>
          ) : (
            <ul className='flex flex-col space-y-8'>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <Comment comment={comment} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
