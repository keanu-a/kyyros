import { notFound } from 'next/navigation';

import { getVideo } from '@/lib/api/videos';
import { getComments } from '@/lib/api/comments';
import { createClient } from '@/lib/supabase/server';

import VideoPageClient from '@/components/video/video-page-client';

// apiFetch has no session on the server, so pass the token to get likedByMe.
// The backend rejects a bad token with 401 even on public GETs, so fall back to anonymous.
async function getCommentsForViewer(videoId: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return getComments(videoId);

  try {
    return await getComments(videoId, session.access_token);
  } catch (e) {
    console.error('Authenticated comments fetch failed, retrying anonymously:', e);
    return getComments(videoId);
  }
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [video, comments] = await Promise.all([
    getVideo(id),
    getCommentsForViewer(id),
  ]);
  if (!video) notFound();

  return (
    <main>
      <VideoPageClient video={video} comments={comments} />
    </main>
  );
}
