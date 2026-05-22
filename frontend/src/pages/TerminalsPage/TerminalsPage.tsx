import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Trash2, Terminal as TerminalIcon, Link, RotateCcw, X, ChevronUp, ChevronDown, ChevronsUpDown, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTerminals, useCreateTerminal, useDeleteTerminal, useCheckTerminal, useAddTerminalGroup, useRemoveTerminalGroup } from '@/hooks/useTerminals';
import { useGroups } from '@/hooks/useGroups';
import { useEnroll } from '@/hooks/useEnroll';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SshTerminal from '@/components/common/SshTerminal';
import CommandBlock from '@/components/common/CommandBlock';
import { getTagColorClass, TERMINAL_STATUS_BADGE_VARIANT } from '@/utils/tagColors';
import { UNCONFIGURED_TAG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Terminal } from '@/types/models.types';

type SortCol = 'name' | 'hostname' | 'os_version' | 'status';

const createTerminalSchema = z.object({
  name: z.string().min(1, 'Requis'),
  hostname: z.string().min(1, 'Requis'),
  port: z.number().min(1).max(65535).default(22),
  username: z.string().default('ubuntu'),
  ssh_key: z.string().min(1, 'Requis'),
});

type CreateTerminalValues = z.infer<typeof createTerminalSchema>;

const EnrollModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { tokenData, permanentData, isTokenLoading, isPermanentLoading, generateToken, fetchPermanentKey, rotateKey, reset } = useEnroll();

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Enroller un terminal</DialogTitle></DialogHeader>
        <Tabs defaultValue="linux">
          <TabsList>
            <TabsTrigger value="linux">Linux</TabsTrigger>
          </TabsList>
          <TabsContent value="linux">
            <Tabs defaultValue="token">
              <TabsList className="mt-2">
                <TabsTrigger value="token">Token temporaire</TabsTrigger>
                <TabsTrigger value="permanent">Clé permanente</TabsTrigger>
              </TabsList>

              <TabsContent value="token" className="space-y-3 mt-3">
                <Alert variant="info">
                  <AlertDescription>Copiez la commande ci-dessous et exécutez-la sur le serveur cible (en sudo). Le token expire après 2h et ne peut être utilisé qu'une fois.</AlertDescription>
                </Alert>
                {!tokenData ? (
                  <Button onClick={generateToken} isLoading={isTokenLoading}>Générer un token</Button>
                ) : (
                  <div>
                    <p className="text-sm font-medium mb-1">Commande à exécuter sur le serveur cible :</p>
                    <CommandBlock command={tokenData.command} />
                    <p className="text-xs text-muted-foreground mt-1">Token valide 2h — usage unique</p>
                  </div>
                )}
                <Alert variant="success">
                  <AlertDescription>Une fois la commande exécutée, le terminal apparaît dans la liste avec le tag Unconfigured.</AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="permanent" className="space-y-3 mt-3">
                <Alert variant="info">
                  <AlertDescription>Cette clé est permanente et réutilisable. Intégrez-la dans un script de premier démarrage de votre ISO Ubuntu personnalisé.</AlertDescription>
                </Alert>
                {!permanentData ? (
                  <Button onClick={fetchPermanentKey} isLoading={isPermanentLoading}>Afficher la clé permanente</Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Commande à intégrer dans l'ISO :</p>
                      <CommandBlock command={permanentData.command} />
                    </div>
                    <Alert variant="warning">
                      <AlertDescription>Ne partagez pas cette clé publiquement. Si votre ISO est compromise, renouvelez la clé ci-dessous.</AlertDescription>
                    </Alert>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm"><RotateCcw className="h-4 w-4" /> Renouveler la clé</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Renouveler la clé permanente ?</AlertDialogTitle>
                          <AlertDialogDescription>Les ISO existants ne pourront plus s'enregistrer automatiquement.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive" onClick={rotateKey}>Renouveler</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface AddTagsModalProps {
  terminal: Terminal | null;
  groups: Array<{ id: string; name: string }>;
  onClose: () => void;
}

const AddTagsModal = ({ terminal, groups, onClose }: AddTagsModalProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const addGroup = useAddTerminalGroup();

  const available = terminal ? groups.filter((g) => !terminal.groups.includes(g.name) && g.name !== UNCONFIGURED_TAG) : [];

  const handleConfirm = async () => {
    if (!terminal || selected.length === 0) return;
    await Promise.all(selected.map((name) => addGroup.mutateAsync({ terminalId: terminal.id, groupName: name })));
    onClose();
    setSelected([]);
  };

  return (
    <Dialog open={!!terminal} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Ajouter des tags</DialogTitle></DialogHeader>
        {available.length === 0 ? (
          <p className="text-muted-foreground text-sm">Tous les tags disponibles sont déjà assignés à ce terminal.</p>
        ) : (
          <div className="space-y-2">
            {available.map((g) => (
              <label key={g.name} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selected.includes(g.name)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) => checked ? [...prev, g.name] : prev.filter((n) => n !== g.name))
                  }
                />
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getTagColorClass(g.name)}`}>{g.name}</span>
              </label>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={selected.length === 0} isLoading={addGroup.isPending}>OK</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function TerminalsPage() {
  const navigate = useNavigate();
  const [sshTarget, setSshTarget] = useState<Terminal | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [addModalTerminal, setAddModalTerminal] = useState<Terminal | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sortCol, setSortCol] = useState<SortCol | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: terminals = [], isLoading, refetch } = useTerminals();
  const { data: groups = [] } = useGroups();
  const createTerminal = useCreateTerminal();
  const deleteTerminal = useDeleteTerminal();
  const checkTerminal = useCheckTerminal();
  const removeGroup = useRemoveTerminalGroup();

  const form = useForm<CreateTerminalValues>({ resolver: zodResolver(createTerminalSchema) });

  const onCreateSubmit = async (values: CreateTerminalValues) => {
    await createTerminal.mutateAsync(values);
    setCreateOpen(false);
    form.reset();
  };

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const allTags = [...new Set(terminals.flatMap((t) => t.groups))].filter((t) => t !== UNCONFIGURED_TAG).sort();

  const displayedTerminals = terminals
    .filter((t) => selectedTags.length === 0 || selectedTags.some((tag) => t.groups.includes(tag)))
    .sort((a, b) => {
      if (!sortCol) return 0;
      const va = String(a[sortCol] ?? '');
      const vb = String(b[sortCol] ?? '');
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const SortIcon = ({ col }: { col: SortCol }) => {
    if (sortCol !== col) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  const SortableHead = ({ col, label }: { col: SortCol; label: string }) => (
    <TableHead>
      <button onClick={() => toggleSort(col)} className="flex items-center hover:text-foreground transition-colors">
        {label}<SortIcon col={col} />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Terminaux</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
          <Button size="sm" onClick={() => setEnrollOpen(true)}>
            <Link className="h-4 w-4" /> Enroll
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <SortableHead col="name" label="Nom" />
              <SortableHead col="hostname" label="IP / Hôte" />
              <SortableHead col="os_version" label="OS" />
              <SortableHead col="status" label="Statut" />
              <TableHead>
                <div className="flex items-center gap-1">
                  Tags
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn('rounded p-0.5 hover:bg-accent transition-colors', selectedTags.length > 0 && 'text-primary')}>
                        <Filter className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="start">
                      {allTags.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Aucun tag disponible</p>
                      ) : (
                        <div className="space-y-1">
                          {allTags.map((tag) => (
                            <label key={tag} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-accent">
                              <Checkbox checked={selectedTags.includes(tag)} onCheckedChange={() => toggleTag(tag)} />
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${getTagColorClass(tag)}`}>{tag}</span>
                            </label>
                          ))}
                          {selectedTags.length > 0 && (
                            <button onClick={() => setSelectedTags([])} className="text-xs text-muted-foreground hover:text-foreground w-full text-left pt-1 mt-1 border-t">
                              Effacer les filtres
                            </button>
                          )}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTerminals.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setSshTarget(t)}>
                        <TerminalIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ouvrir un terminal SSH</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate(`/terminals/${t.id}`)}>
                    {t.name}
                  </Button>
                </TableCell>
                <TableCell className="text-sm">{t.hostname}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.os_version ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant={TERMINAL_STATUS_BADGE_VARIANT[t.status]}>{t.status}</Badge>
                    {t.groups.includes(UNCONFIGURED_TAG) && <Badge variant="warning">Non configuré</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {t.groups.filter((g) => g !== UNCONFIGURED_TAG).map((g) => (
                      <span key={g} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${getTagColorClass(g)}`}>
                        {g}
                        <button onClick={() => removeGroup.mutate({ terminalId: t.id, groupName: g })} className="hover:opacity-70">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => setAddModalTerminal(t)} className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs border border-dashed border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Ajouter des tags</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => checkTerminal.mutate(t.id)}>
                      <RefreshCw className="h-3 w-3" /> Tester
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer {t.name} ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive" onClick={() => deleteTerminal.mutate(t.id)}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <SshTerminal terminal={sshTarget} open={!!sshTarget} onClose={() => setSshTarget(null)} />
      <EnrollModal open={enrollOpen} onClose={() => { setEnrollOpen(false); refetch(); }} />
      <AddTagsModal terminal={addModalTerminal} groups={groups} onClose={() => setAddModalTerminal(null)} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter manuellement</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="hostname" render={({ field }) => (
                <FormItem><FormLabel>IP / Hostname</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="port" render={({ field }) => (
                <FormItem><FormLabel>Port SSH</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>Utilisateur SSH</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="ssh_key" render={({ field }) => (
                <FormItem>
                  <FormLabel>Clé SSH privée</FormLabel>
                  <FormControl>
                    <textarea rows={5} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono" placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" isLoading={createTerminal.isPending}>Ajouter</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
