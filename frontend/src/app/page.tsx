import VideoFeed from '@/components/video/video-feed';

export default async function Home() {
  return (
    <main className='min-h-screen'>
      <div className='flex flex-col min-h-screen items-center justify-center'>
        <h1 className='text-2xl font-semibold'>Kyyros</h1>
        <div className='text-lg'>
          <p>Welcome!</p>
        </div>
      </div>

      <div className='container mx-auto py-8 px-4'>
        <VideoFeed />
      </div>
    </main>
  );
}
