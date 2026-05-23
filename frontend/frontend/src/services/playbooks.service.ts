import api from './api';
import type { PlaybookRun, LaunchPlaybookPayload } from '@/types/models.types';

export const fetchRuns = (): Promise<PlaybookRun[]> =>
  api.get<PlaybookRun[]>('/playbooks/runs').then((r) => r.data);

export const fetchAvailablePlaybooks = (): Promise<string[]> =>
  api.get<{ playbooks: string[] }>('/playbooks/available').then((r) => r.data.playbooks);

export const launchPlaybook = (payload: LaunchPlaybookPayload): Promise<PlaybookRun> =>
  api.post<PlaybookRun>('/playbooks/runs', payload).then((r) => r.data);

export const createPlaybook = (filename: string, content: string): Promise<void> =>
  api.post('/playbooks/create', { filename, content }).then(() => undefined);
