'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { useUser } from '@/contexts/user-context';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { buttonVariants } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const { user, isLoading, isAuthenticated } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className='flex items-center justify-between py-3 px-4 sticky top-0 z-50 bg-background'>
      <Link href='/'>
        <span>Kyyros</span>
      </Link>

      <div className='relative'>
        <Search
          size={18}
          className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
        />
        <Input placeholder='Search...' className='pl-10 w-auto rounded-full' />
      </div>

      <div>
        {isLoading ? null : isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className='cursor-pointer'>
              <Avatar>
                <AvatarImage />
                <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='mx-2'>
              <DropdownMenuLabel>@{user.username}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className='*:cursor-pointer'>
                <DropdownMenuItem asChild>
                  <Link href='/'>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/upload'>Upload</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/' onClick={handleLogout}>
                    Log out
                  </Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className='space-x-1'>
            <Link
              href='/login'
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'rounded-full px-3',
              )}
            >
              Log in
            </Link>
            <Link
              href='/signup'
              className={cn(
                buttonVariants({ variant: 'default' }),
                'rounded-full px-3',
              )}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
