import { notFound } from 'next/navigation';

import { getVideo } from '@/lib/api/videos';
import VideoPlayer from '@/components/video/video-player';

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) notFound();

  return (
    <main>
      <VideoPlayer playbackId={video.playbackId} title={video.title} />
      <h1>Video: {video.title}</h1>
    </main>
  );
}
