import VideoFeed from '@/components/video/video-feed';
import HeroPreview from '@/components/hero-preview';

export default async function Home() {
  return (
    <main className='min-h-screen px-4'>
      <section>
        <div className='container mx-auto py-8 md:py-20'>
          <div className='max-w-5xl mx-auto'>
            <HeroPreview />
          </div>
        </div>
      </section>

      <section className='container mx-auto'>
        <VideoFeed />
      </section>
    </main>
  );
}
