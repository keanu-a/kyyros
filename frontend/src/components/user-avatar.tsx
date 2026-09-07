'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
}

const AVATAR_SIZE = 24;

export default function UserAvatar({ name, avatarUrl }: UserAvatarProps) {
  const fallback = name?.charAt(0) ?? '.';

  return (
    <Avatar
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      aria-label={`Avatar for ${name}`}
    >
      <AvatarImage src={avatarUrl ?? undefined} alt={name} />
      <AvatarFallback className='text-xs font-medium bg-brand text-brand-secondary'>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
