import { notFound } from 'next/navigation';

import { getVideo } from '@/lib/api/videos';
import { getComments } from '@/lib/api/comments';

import VideoPageClient from '@/components/video/video-page-client';

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
      <VideoPageClient video={video} comments={comments} />
    </main>
  );
}
