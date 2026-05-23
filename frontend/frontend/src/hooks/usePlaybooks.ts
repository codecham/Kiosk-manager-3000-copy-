import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import * as playbooksService from '@/services/playbooks.service';
import type { LaunchPlaybookPayload } from '@/types/models.types';

export const useRuns = () =>
  useQuery({ queryKey: ['runs'], queryFn: playbooksService.fetchRuns });

export const useAvailablePlaybooks = () =>
  useQuery({ queryKey: ['available-playbooks'], queryFn: playbooksService.fetchAvailablePlaybooks });

export const useLaunchPlaybook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LaunchPlaybookPayload) => playbooksService.launchPlaybook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      toast.success('Playbook lancé');
    },
  });
};

export const useCreatePlaybook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ filename, content }: { filename: string; content: string }) =>
      playbooksService.createPlaybook(filename, content),
    onSuccess: (_, { filename }) => {
      queryClient.invalidateQueries({ queryKey: ['available-playbooks'] });
      toast.success(`Playbook "${filename}" créé`);
    },
    onError: (error: unknown) => {
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
      toast.error(detail ?? 'Erreur lors de la création');
    },
  });
};
