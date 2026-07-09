import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/profile-form';
import ChangePasswordForm from '@/components/auth/change-password-form';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className='flex flex-col items-center justify-center space-y-4 py-12 px-4'>
      <ProfileForm />
      <ChangePasswordForm />
    </div>
  );
}
