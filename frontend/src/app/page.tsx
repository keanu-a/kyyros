import VideoFeed from '@/components/video/video-feed';
import HeroPreview from '@/components/hero-preview';

export default async function Home() {
  return (
    <main className='min-h-screen md:px-4'>
      <section>
        <div className='container mx-auto pb-8 md:py-20'>
          <HeroPreview />
        </div>
      </section>
      <section className='container mx-auto'>
        <VideoFeed />
      </section>
    </main>
  );
}
