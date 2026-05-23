import api from './api';
import { CONSOLE_URL } from '@/lib/constants';
import type { EnrollToken, PermanentKey } from '@/types/models.types';

export const createEnrollToken = (): Promise<EnrollToken> =>
  api
    .post<EnrollToken>(`/enroll/token?console_url=${encodeURIComponent(CONSOLE_URL)}`)
    .then((r) => r.data);

export const getPermanentKey = (): Promise<PermanentKey> =>
  api
    .get<PermanentKey>(`/enroll/permanent-key?console_url=${encodeURIComponent(CONSOLE_URL)}`)
    .then((r) => r.data);

export const rotateKey = (): Promise<void> =>
  api.post('/enroll/rotate-key').then(() => undefined);
