import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { UserProvider } from '@/contexts/user-context';
import Navbar from '@/components/navbar';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kyyros',
  description: 'Video platform with timestamp comments',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={cn(
        'h-full',
        'antialiased',
        manrope.variable,
        inter.variable,
        'font-sans',
      )}
    >
      <body className='min-h-full flex flex-col font-body'>
        <UserProvider>
          <Navbar />
          {children}
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
