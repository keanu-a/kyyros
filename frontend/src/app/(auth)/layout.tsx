import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex items-center justify-center p-4 my-auto md:p-10'>
      <div className='w-full max-w-sm'>{children}</div>
    </div>
  );
}
