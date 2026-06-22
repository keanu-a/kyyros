import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import UploadForm from '@/components/upload/upload-form';

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <main>
      <UploadForm />
    </main>
  );
}
