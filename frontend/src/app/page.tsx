import Link from 'next/link';

import VideoFeed from '@/components/video/video-feed';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HeroPreview from '@/components/hero-preview';

export default async function Home() {
  return (
    <main className='min-h-screen px-4'>
      <section>
        <div className='container mx-auto px-4 py-16 md:py-20'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center'>
            <div className='max-w-md'>
              <h1 className='text-xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-4'>
                Comment where it happens.
              </h1>
              <p className='text-muted-foreground mb-6'>
                Timestamps become conversations.
              </p>
              <Link
                href='/upload'
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'px-4 py-2 rounded-full',
                )}
              >
                Upload a video
              </Link>
            </div>

            <div className='w-full'>
              <HeroPreview />
            </div>
          </div>
        </div>
      </section>

      <section className='container mx-auto py-8'>
        <VideoFeed />
      </section>
    </main>
  );
}
