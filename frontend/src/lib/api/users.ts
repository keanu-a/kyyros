import { apiFetch } from './fetcher';
import type { UserSummary } from '@/types/user';

export function getCurrentUser(): Promise<UserSummary> {
  return apiFetch(
    'api/v1/users/me',
    {
      method: 'GET',
    },
    {
      requireAuth: true,
    },
  );
}
