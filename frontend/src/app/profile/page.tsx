import { redirect } from 'next/navigation';

import ProfileForm from '@/components/profile-form';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className='flex justify-center pt-12 px-4'>
      <ProfileForm />
    </div>
  );
}
