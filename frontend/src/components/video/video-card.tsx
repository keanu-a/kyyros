import Image from 'next/image';
import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';

import type { VideoSummaryResponse } from '@/lib/api/videos';
import UserAvatar from '../user-avatar';

type VideoCardProps = {
  video: VideoSummaryResponse;
};

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className='hover:bg-muted transition-all p-2 rounded-lg'
    >
      {/* Thumbnail */}
      <div className='relative aspect-video w-full overflow-hidden rounded-lg bg-muted'>
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
          className='object-cover transition-transform group-hover:scale-105'
        />
      </div>

      {/* Title + metadata */}
      <div className='relative flex flex-col px-1 py-2 gap-2'>
        <h3 className='line-clamp-2 font-semibold leading-tight'>
          {video.title}
        </h3>
        <div className='flex items-center gap-1.5 text-sm'>
          <UserAvatar name={video.uploaderUsername} />
          <p className='text-muted-foreground font-medium'>
            {video.uploaderUsername}
          </p>
          <p className='text-muted-foreground'>
            &middot;{' '}
            {formatDistanceToNow(new Date(video.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}
