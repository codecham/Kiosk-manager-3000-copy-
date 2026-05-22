import { useState } from 'react';
import type { ReactNode } from 'react';
import { Plus, Play, Eye, Copy, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRuns, useAvailablePlaybooks, useLaunchPlaybook, useCreatePlaybook } from '@/hooks/usePlaybooks';
import { useGroups } from '@/hooks/useGroups';
import { useTerminals } from '@/hooks/useTerminals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import TerminalListModal from '@/components/common/TerminalListModal';
import { formatDate } from '@/lib/utils';
import { UNCONFIGURED_TAG } from '@/lib/constants';
import { getTagColorClass } from '@/utils/tagColors';
import type { PlaybookRun, RunStatus, Terminal } from '@/types/models.types';

type SortCol = 'name' | 'playbook_path' | 'status' | 'created_at';

const RUN_STATUS_VARIANT: Record<RunStatus, 'success' | 'destructive' | 'info' | 'warning'> = {
  success: 'success', failed: 'destructive', running: 'info', pending: 'warning',
};

const PLAYBOOK_TEMPLATE = `---
- name: Mon playbook
  hosts: all
  become: yes
  gather_facts: yes

  tasks:
    - name: Vérifier la connectivité
      ping:
`;

const launchSchema = z.object({
  playbook_path: z.string().min(1, 'Requis'),
  target_groups: z.array(z.string()).min(1, 'Sélectionnez au moins un groupe'),
  name: z.string().optional(),
});

const createSchema = z.object({
  filename: z.string().min(1, 'Requis'),
  content: z.string().min(1, 'Requis'),
});

type LaunchValues = z.infer<typeof launchSchema>;
type CreateValues = z.infer<typeof createSchema>;

const LogsModal = ({ run, onClose }: { run: PlaybookRun | null; onClose: () => void }) => {
  const content = run?.output ?? '(aucun log)';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Logs copiés dans le presse-papiers');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${run?.name ?? 'logs'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={!!run} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Logs — {run?.name}</DialogTitle>
            <div className="flex gap-2 mr-8">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4" /> Copier
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <ExternalLink className="h-4 w-4" /> Télécharger
              </Button>
            </div>
          </div>
        </DialogHeader>
        <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-md max-h-[500px] overflow-auto text-xs font-mono">
          {content}
        </pre>
      </DialogContent>
    </Dialog>
  );
};

export default function PlaybooksPage() {
  const [launchOpen, setLaunchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PlaybookRun | null>(null);
  const [targetModal, setTargetModal] = useState<{ title: ReactNode; terminals: Terminal[] } | null>(null);
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data: runs = [], isLoading } = useRuns();
  const { data: playbooks = [] } = useAvailablePlaybooks();
  const { data: groups = [] } = useGroups();
  const { data: terminals = [] } = useTerminals();
  const launchPlaybook = useLaunchPlaybook();
  const createPlaybook = useCreatePlaybook();

  const launchForm = useForm<LaunchValues>({ resolver: zodResolver(launchSchema), defaultValues: { target_groups: [] } });
  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { content: PLAYBOOK_TEMPLATE },
  });

  const onLaunch = async (values: LaunchValues) => {
    await launchPlaybook.mutateAsync({
      name: values.name ?? values.playbook_path,
      playbook_path: values.playbook_path,
      target_groups: values.target_groups,
    });
    setLaunchOpen(false);
    launchForm.reset();
  };

  const onCreate = async (values: CreateValues) => {
    await createPlaybook.mutateAsync(values);
    setCreateOpen(false);
    createForm.reset();
  };

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const sortedRuns = [...runs].sort((a, b) => {
    if (!sortCol) return 0;
    const va = String(a[sortCol] ?? '');
    const vb = String(b[sortCol] ?? '');
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const openGroupTarget = (groupName: string) => {
    setTargetModal({
      title: <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getTagColorClass(groupName)}`}>{groupName}</span>,
      terminals: terminals.filter((t) => t.groups.includes(groupName)),
    });
  };

  const openHostsTarget = (run: PlaybookRun) => {
    setTargetModal({
      title: 'Terminaux ciblés',
      terminals: terminals.filter((t) => run.target_hosts.includes(t.id)),
    });
  };

  const availableGroups = groups.filter((g) => g.name !== UNCONFIGURED_TAG);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Playbooks Ansible</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { createForm.reset({ content: PLAYBOOK_TEMPLATE }); setCreateOpen(true); }}>
            <Plus className="h-4 w-4" /> Créer un playbook
          </Button>
          <Button size="sm" onClick={() => setLaunchOpen(true)}>
            <Play className="h-4 w-4" /> Lancer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button onClick={() => toggleSort('name')} className="flex items-center hover:text-foreground transition-colors">
                  Nom<SortIcon col="name" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort('playbook_path')} className="flex items-center hover:text-foreground transition-colors">
                  Playbook<SortIcon col="playbook_path" />
                </button>
              </TableHead>
              <TableHead>Cibles</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('status')} className="flex items-center hover:text-foreground transition-colors">
                  Statut<SortIcon col="status" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort('created_at')} className="flex items-center hover:text-foreground transition-colors">
                  Date<SortIcon col="created_at" />
                </button>
              </TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRuns.map((run) => (
              <TableRow key={run.id}>
                <TableCell>{run.name}</TableCell>
                <TableCell className="font-mono text-xs">{run.playbook_path}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {run.target_groups.map((g) => (
                      <button key={g} onClick={() => openGroupTarget(g)}>
                        <Badge variant="info" className="text-xs cursor-pointer hover:opacity-80">{g}</Badge>
                      </button>
                    ))}
                    {run.target_hosts.length > 0 && (
                      <button onClick={() => openHostsTarget(run)}>
                        <Badge variant="secondary" className="text-xs cursor-pointer hover:opacity-80">
                          {run.target_hosts.length > 1 ? `${run.target_hosts.length} terminaux` : `${run.target_hosts.length} terminal`}
                        </Badge>
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell><Badge variant={RUN_STATUS_VARIANT[run.status]}>{run.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-xs">{formatDate(run.created_at)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRun(run)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal lancement */}
      <Dialog open={launchOpen} onOpenChange={setLaunchOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lancer un playbook</DialogTitle></DialogHeader>
          <Form {...launchForm}>
            <form onSubmit={launchForm.handleSubmit(onLaunch)} className="space-y-4">
              <FormField control={launchForm.control} name="playbook_path" render={({ field }) => (
                <FormItem>
                  <FormLabel>Playbook</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un playbook" /></SelectTrigger></FormControl>
                    <SelectContent>{playbooks.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={launchForm.control} name="target_groups" render={({ field }) => (
                <FormItem>
                  <FormLabel>Groupes cibles</FormLabel>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                    {availableGroups.length === 0 && (
                      <p className="text-sm text-muted-foreground">Aucun groupe disponible</p>
                    )}
                    {availableGroups.map((g) => (
                      <label key={g.name} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={(field.value ?? []).includes(g.name)}
                          onCheckedChange={(checked: boolean | 'indeterminate') => {
                            const current = field.value ?? [];
                            field.onChange(checked ? [...current, g.name] : current.filter((n: string) => n !== g.name));
                          }}
                        />
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${getTagColorClass(g.name)}`}>{g.name}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={launchForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom de l'exécution (optionnel)</FormLabel><FormControl><Input placeholder="Mise à jour prod" {...field} /></FormControl></FormItem>
              )} />
              <Alert variant="info">
                <AlertDescription>Un playbook réussi retire automatiquement le tag 'Non configuré' des terminaux ciblés.</AlertDescription>
              </Alert>
              <Button type="submit" className="w-full" isLoading={launchPlaybook.isPending}>
                <Play className="h-4 w-4" /> Lancer
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Créer un playbook</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              <FormField control={createForm.control} name="filename" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du fichier</FormLabel>
                  <FormControl><Input placeholder="mon_playbook" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu YAML</FormLabel>
                  <FormControl>
                    <textarea
                      rows={18}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" isLoading={createPlaybook.isPending}>Créer le playbook</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <LogsModal run={selectedRun} onClose={() => setSelectedRun(null)} />
      <TerminalListModal
        open={!!targetModal}
        title={targetModal?.title}
        terminals={targetModal?.terminals ?? []}
        onClose={() => setTargetModal(null)}
      />
    </div>
  );
}
