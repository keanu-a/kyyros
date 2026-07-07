import { apiFetch } from './fetcher';
import type { UpdateUserRequest, UserSummary } from '@/types/user';

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

export function updateCurrentUser(
  request: UpdateUserRequest,
): Promise<UserSummary> {
  return apiFetch(
    '/api/v1/users/me',
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    },
    {
      requireAuth: true,
    },
  );
}
