import { createClient } from '../supabase/client';
import { RateLimitError } from './errors';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

// Reusable API fetcher function to grab token and attach it to the request
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  { requireAuth = true }: { requireAuth?: boolean } = {},
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (requireAuth && !session) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(session && { Authorization: `Bearer ${session.access_token}` }),
    },
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new RateLimitError();
    }

    throw new Error(`Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return null as unknown as T;
  }

  return res.json() as T;
}
