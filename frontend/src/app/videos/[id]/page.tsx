import { notFound } from 'next/navigation';

import VideoPlayer from '@/components/video/video-player';

import { getVideo } from '@/lib/api/videos';
import { getComments } from '@/lib/api/comments';

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

      <h1 className='font-bold text-lg'>{video.title}</h1>
      <div>
        <h2>Comments</h2>
        {!comments.length ? (
          <p className='text-sm text-muted-foreground'>No comments yet</p>
        ) : (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <p>{comment.content}</p>
                <p>{comment.timestampSeconds}</p>
                <p>By {comment.user.username}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
