import VideoFeed from '@/components/video/video-feed';
import HeroPreview from '@/components/hero-preview';

export default async function Home() {
  return (
    <main className='min-h-screen md:px-4'>
      <div className='max-w-[1850px] mx-auto'>
        <section>
          <div className='mx-auto pb-8 md:py-20'>
            <HeroPreview />
          </div>
        </section>
        <section className='mx-auto'>
          <VideoFeed />
        </section>
      </div>
    </main>
  );
}
