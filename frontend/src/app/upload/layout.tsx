import { ReactNode } from 'react';

export default function UploadLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex my-auto items-center justify-center p-4 md:p-10'>
      <div className='w-full max-w-sm'>{children}</div>
    </div>
  );
}
