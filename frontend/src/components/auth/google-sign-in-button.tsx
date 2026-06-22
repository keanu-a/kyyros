'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '../ui/button';

export function GoogleSignInButton() {
  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full cursor-pointer"
      onClick={handleGoogleSignIn}
    >
      Sign in with Google
    </Button>
  );
}
