'use client';

import { HeartIcon } from 'lucide-react';

import { useVideoLike } from '@/hooks/use-video-like';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

type LikeButtonProps = {
  videoId: string;
  initialLikeCount: number;
};

export default function LikeButton({
  videoId,
  initialLikeCount,
}: LikeButtonProps) {
  const { likeCount, likedByMe, toggleLike } = useVideoLike(
    videoId,
    initialLikeCount,
  );

  return (
    <Button
      variant='outline'
      size='sm'
      className='cursor-pointer rounded-full'
      onClick={toggleLike}
      aria-pressed={likedByMe}
      aria-label={likedByMe ? 'Unlike video' : 'Like video'}
    >
      <HeartIcon className={cn(likedByMe && 'fill-red-500 text-red-500')} />
      <span className='tabular-nums'>{likeCount.toLocaleString()}</span>
    </Button>
  );
}
