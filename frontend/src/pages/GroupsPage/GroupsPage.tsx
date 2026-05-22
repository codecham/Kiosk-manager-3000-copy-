import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGroups, useCreateGroup, useDeleteGroup } from '@/hooks/useGroups';
import { useTerminals } from '@/hooks/useTerminals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TerminalListModal from '@/components/common/TerminalListModal';
import { getTagColorClass } from '@/utils/tagColors';
import { UNCONFIGURED_TAG } from '@/lib/constants';
import type { Group, Terminal, TerminalStatus } from '@/types/models.types';

const createGroupSchema = z.object({
  name: z.string().min(1, 'Requis'),
  description: z.string().optional(),
});

type CreateGroupValues = z.infer<typeof createGroupSchema>;
type GroupSortCol = 'name' | 'terminal_count';

const STATUS_LABEL: Record<TerminalStatus, string> = { online: 'En ligne', offline: 'Hors ligne', unknown: 'Inconnu' };
const STATUS_VARIANT: Record<TerminalStatus, 'success' | 'destructive' | 'secondary'> = {
  online: 'success', offline: 'destructive', unknown: 'secondary',
};

export default function GroupsPage() {
  const [terminalModal, setTerminalModal] = useState<{ title: React.ReactNode; terminals: Terminal[] } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sortCol, setSortCol] = useState<GroupSortCol | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data: groups = [], isLoading } = useGroups();
  const { data: terminals = [] } = useTerminals();
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = async (values: CreateGroupValues) => {
    await createGroup.mutateAsync(values);
    setCreateOpen(false);
    form.reset();
  };

  const toggleSort = (col: GroupSortCol) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: GroupSortCol }) => {
    if (sortCol !== col) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const openStatusModal = (status: TerminalStatus) =>
    setTerminalModal({
      title: <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>,
      terminals: terminals.filter((t) => t.status === status),
    });

  const openUnconfiguredModal = () =>
    setTerminalModal({
      title: <Badge variant="warning">Non configuré</Badge>,
      terminals: terminals.filter((t) => t.groups.includes(UNCONFIGURED_TAG)),
    });

  const openGroupModal = (group: Group) =>
    setTerminalModal({
      title: <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getTagColorClass(group.name)}`}>{group.name}</span>,
      terminals: terminals.filter((t) => t.groups.includes(group.name)),
    });

  const sortedGroups = [...groups].filter((g) => g.name !== UNCONFIGURED_TAG).sort((a, b) => {
    if (!sortCol) return 0;
    if (sortCol === 'terminal_count') return sortDir === 'asc' ? a.terminal_count - b.terminal_count : b.terminal_count - a.terminal_count;
    return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  const visibleGroups = groups.filter((g) => g.name !== UNCONFIGURED_TAG);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Groupes / Tags Ansible</h1>
          <p className="text-sm text-muted-foreground">Les noms de groupes sont utilisés directement dans Ansible.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Créer un groupe
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Statuts</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(['online', 'offline', 'unknown'] as TerminalStatus[]).map((status) => (
              <button key={status} onClick={() => openStatusModal(status)} className="flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-accent transition-colors text-sm">
                <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                <span className="font-medium">{terminals.filter((t) => t.status === status).length}</span>
              </button>
            ))}
            <button onClick={openUnconfiguredModal} className="flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-accent transition-colors text-sm">
              <Badge variant="warning">Non configuré</Badge>
              <span className="font-medium">{terminals.filter((t) => t.groups.includes(UNCONFIGURED_TAG)).length}</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {visibleGroups.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {visibleGroups.map((g) => (
                <button key={g.id} onClick={() => openGroupModal(g)} className="flex items-center gap-1.5 rounded-md border px-2 py-1 hover:bg-accent transition-colors">
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${getTagColorClass(g.name)}`}>{g.name}</span>
                  <span className="text-xs text-muted-foreground">{g.terminal_count}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              <TableHead>Description</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('terminal_count')} className="flex items-center hover:text-foreground transition-colors">
                  Terminaux<SortIcon col="terminal_count" />
                </button>
              </TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGroups.map((g) => (
              <TableRow key={g.id}>
                <TableCell>
                  <button onClick={() => openGroupModal(g)}>
                    <Badge className={`cursor-pointer text-xs px-2 py-0.5 ${getTagColorClass(g.name)}`} variant="outline">{g.name}</Badge>
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{g.description ?? '—'}</TableCell>
                <TableCell>
                  <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => openGroupModal(g)}>
                    {g.terminal_count > 1 ? `${g.terminal_count} terminaux` : `${g.terminal_count} terminal`}
                  </Button>
                </TableCell>
                <TableCell>
                  {g.name !== UNCONFIGURED_TAG && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer ce groupe ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteGroup.mutate(g.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Créer un groupe</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <Button type="submit" className="w-full" isLoading={createGroup.isPending}>Créer</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <TerminalListModal
        open={!!terminalModal}
        title={terminalModal?.title}
        terminals={terminalModal?.terminals ?? []}
        onClose={() => setTerminalModal(null)}
      />
    </div>
  );
}
