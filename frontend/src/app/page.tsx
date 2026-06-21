import { Button } from '@/components/ui/button';

import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/actions/actions';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold">Kyyros</h1>
      <div className="text-lg">
        {user ? (
          <div>
            <p>Welcome, {user.email}!</p>
            <form action={signOut}>
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        ) : (
          <p>Not logged in</p>
        )}
      </div>
    </div>
  );
}
