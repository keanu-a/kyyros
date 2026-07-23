import Image from 'next/image';
import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';

import type { VideoSummaryResponse } from '@/lib/api/videos';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type VideoCardProps = {
  video: VideoSummaryResponse;
};

const AVATAR_SIZE = 24;

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
          <Avatar
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            aria-label={`Comment by ${video.uploaderUsername}`}
          >
            <AvatarImage src={undefined} alt={video.uploaderUsername} />
            <AvatarFallback className='text-background bg-foreground'>
              {video.uploaderUsername?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <p className='text-muted-foreground font-semibold'>
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
