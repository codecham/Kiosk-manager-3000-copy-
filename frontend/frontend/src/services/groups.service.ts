import api from './api';
import type { Group } from '@/types/models.types';

interface CreateGroupPayload {
  name: string;
  description?: string;
}

export const fetchGroups = (): Promise<Group[]> =>
  api.get<Group[]>('/groups/').then((r) => r.data);

export const createGroup = (payload: CreateGroupPayload): Promise<Group> =>
  api.post<Group>('/groups/', payload).then((r) => r.data);

export const deleteGroup = (id: string): Promise<void> =>
  api.delete(`/groups/${id}`).then(() => undefined);
