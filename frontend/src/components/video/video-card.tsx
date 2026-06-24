import Image from 'next/image';
import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';

import type { VideoSummaryResponse } from '@/lib/api/videos';

type VideoCardProps = {
  video: VideoSummaryResponse;
};

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/videos/${video.id}`}>
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* Title + metadata */}
      <div className="flex items-center">
        <h3 className="line-clamp-2 font-medium leading-tight">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {video.uploaderUsername} -{' '}
          {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
}
