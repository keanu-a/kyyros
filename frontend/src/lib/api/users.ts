import { apiFetch } from './fetcher';
import type { UserSummary } from '@/types/user';

export function getCurrentUser(signal?: AbortSignal): Promise<UserSummary> {
  return apiFetch(
    '/api/v1/users/me',
    {
      method: 'GET',
      signal,
    },
    {
      requireAuth: true,
    },
  );
}
