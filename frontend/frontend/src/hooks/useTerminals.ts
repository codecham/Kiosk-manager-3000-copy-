import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as terminalsService from '@/services/terminals.service';
import type { CreateTerminalPayload } from '@/types/models.types';

export const useTerminals = () =>
  useQuery({ queryKey: ['terminals'], queryFn: terminalsService.fetchTerminals });

export const useTerminal = (id: string) =>
  useQuery({ queryKey: ['terminal', id], queryFn: () => terminalsService.fetchTerminal(id) });

export const useTerminalDetails = (id: string) =>
  useQuery({
    queryKey: ['terminal-details', id],
    queryFn: () => terminalsService.fetchTerminalDetails(id),
    refetchInterval: 30_000,
  });

export const useCreateTerminal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTerminalPayload) => terminalsService.createTerminal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      toast.success('Terminal ajouté');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });
};

export const useDeleteTerminal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => terminalsService.deleteTerminal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      toast.success('Terminal supprimé');
    },
  });
};

export const useCheckTerminal = () =>
  useMutation({
    mutationFn: (id: string) => terminalsService.checkTerminal(id),
    onSuccess: (data) => toast.info(data.message),
  });

export const useAddTerminalGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ terminalId, groupName }: { terminalId: string; groupName: string }) =>
      terminalsService.addTerminalGroup(terminalId, groupName),
    onSuccess: (_, { terminalId, groupName }) => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      queryClient.invalidateQueries({ queryKey: ['terminal', terminalId] });
      toast.success(`Tag "${groupName}" ajouté`);
    },
    onError: () => toast.error("Erreur lors de l'ajout du tag"),
  });
};

export const useRemoveTerminalGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ terminalId, groupName }: { terminalId: string; groupName: string }) =>
      terminalsService.removeTerminalGroup(terminalId, groupName),
    onSuccess: (_, { terminalId }) => {
      queryClient.invalidateQueries({ queryKey: ['terminal', terminalId] });
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
    },
    onError: () => toast.error('Erreur lors de la suppression du tag'),
  });
};
