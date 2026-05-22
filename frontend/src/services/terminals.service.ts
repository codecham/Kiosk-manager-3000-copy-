import api from './api';
import type { Terminal, CreateTerminalPayload, SystemInfo } from '@/types/models.types';

export const fetchTerminals = (): Promise<Terminal[]> =>
  api.get<Terminal[]>('/terminals/').then((r) => r.data);

export const fetchTerminal = (id: string): Promise<Terminal> =>
  api.get<Terminal>(`/terminals/${id}`).then((r) => r.data);

export const createTerminal = (payload: CreateTerminalPayload): Promise<Terminal> =>
  api.post<Terminal>('/terminals/', payload).then((r) => r.data);

export const deleteTerminal = (id: string): Promise<void> =>
  api.delete(`/terminals/${id}`).then(() => undefined);

export const checkTerminal = (id: string): Promise<{ message: string }> =>
  api.post<{ message: string }>(`/terminals/${id}/check`).then((r) => r.data);

export const fetchTerminalDetails = (id: string): Promise<{ success: boolean; info?: SystemInfo; error?: string }> =>
  api.get(`/terminals/${id}/details`).then((r) => r.data);

export const addTerminalGroup = (terminalId: string, groupName: string): Promise<void> =>
  api.post(`/terminals/${terminalId}/groups/${encodeURIComponent(groupName)}`).then(() => undefined);

export const removeTerminalGroup = (terminalId: string, groupName: string): Promise<void> =>
  api.delete(`/terminals/${terminalId}/groups/${encodeURIComponent(groupName)}`).then(() => undefined);
