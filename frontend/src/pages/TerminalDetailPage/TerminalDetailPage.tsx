import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Terminal as TerminalIcon, Play, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTerminal, useTerminalDetails, useRemoveTerminalGroup } from '@/hooks/useTerminals';
import { useGroups } from '@/hooks/useGroups';
import { useLaunchPlaybook, useAvailablePlaybooks } from '@/hooks/usePlaybooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import SshTerminal from '@/components/common/SshTerminal';
import AddTagsModal from '@/components/common/AddTagsModal';
import { getTagColorClass, TERMINAL_STATUS_BADGE_VARIANT } from '@/utils/tagColors';
import { UNCONFIGURED_TAG } from '@/lib/constants';
import { cn } from '@/lib/utils';

const getProgressColor = (percent: number): string => {
  if (percent > 85) return 'bg-red-500';
  if (percent > 60) return 'bg-yellow-500';
  return 'bg-green-500';
};

const playbookSchema = z.object({ playbook: z.string().min(1, 'Requis') });
type PlaybookFormValues = z.infer<typeof playbookSchema>;

interface DescriptionGridProps {
  items: Array<{ label: string; value: string | number | undefined }>;
}

const DescriptionGrid = ({ items }: DescriptionGridProps) => (
  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
    {items.map(({ label, value }) => (
      <div key={label}>
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="font-medium mt-0.5">{value ?? '—'}</dd>
      </div>
    ))}
  </dl>
);

export default function TerminalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sshOpen, setSshOpen] = useState(false);
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const [addTagsOpen, setAddTagsOpen] = useState(false);

  const { data: terminal, isLoading: terminalLoading } = useTerminal(id!);
  const { data: details, isLoading: detailsLoading } = useTerminalDetails(id!);
  const { data: groups = [] } = useGroups();
  const { data: playbooks = [] } = useAvailablePlaybooks();
  const removeGroup = useRemoveTerminalGroup();
  const launchPlaybook = useLaunchPlaybook();

  const playbookForm = useForm<PlaybookFormValues>({ resolver: zodResolver(playbookSchema) });

  const isUnconfigured = terminal?.groups.includes(UNCONFIGURED_TAG) ?? false;

  const sysInfo = details?.success ? details.info : undefined;
  const sysError = details && !details.success ? details.error : undefined;
  const toGB = (mb: number): string => (mb / 1024).toFixed(1);
  const ramPercent = sysInfo ? Math.round((sysInfo.ram_used_mb / sysInfo.ram_total_mb) * 100) : 0;
  const diskPercent = sysInfo ? parseInt(sysInfo.disk_percent) : 0;

  const onLaunchPlaybook = async ({ playbook }: PlaybookFormValues) => {
    if (!terminal) return;
    await launchPlaybook.mutateAsync({
      name: `${playbook} — ${terminal.name}`,
      playbook_path: playbook,
      target_groups: [],
      target_hosts: [terminal.id],
    });
    setPlaybookOpen(false);
    playbookForm.reset();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => navigate('/terminals')}>
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>

        <div className="flex items-center gap-2 flex-1">
          {terminalLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <>
              <h1 className="text-xl font-semibold">{terminal?.name}</h1>
              {terminal && <Badge variant={TERMINAL_STATUS_BADGE_VARIANT[terminal.status]}>{terminal.status}</Badge>}
              {isUnconfigured && <Badge variant="warning">Non configuré</Badge>}
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSshOpen(true)} disabled={!terminal}>
            <TerminalIcon className="h-4 w-4" /> Terminal SSH
          </Button>
          <Button size="sm" onClick={() => setPlaybookOpen(true)} disabled={!terminal}>
            <Play className="h-4 w-4" /> Lancer un playbook
          </Button>
        </div>
      </div>

      {/* Informations */}
      <Card>
        <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
        <CardContent>
          {terminalLoading ? <Skeleton className="h-24" /> : terminal ? (
            <DescriptionGrid items={[
              { label: 'IP / Hostname', value: terminal.hostname },
              { label: 'Port SSH', value: terminal.port },
              { label: 'Utilisateur SSH', value: terminal.username },
              { label: 'OS (enrollment)', value: terminal.os_version },
              { label: 'Adresse MAC', value: terminal.mac_address },
              { label: 'Numéro de série', value: terminal.serial_number },
            ]} />
          ) : null}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader>
        <CardContent>
          {terminalLoading ? <Skeleton className="h-8 w-48" /> : (
            <div className="flex flex-wrap gap-2 items-center">
              {terminal?.groups.filter((g) => g !== UNCONFIGURED_TAG).map((g) => (
                <AlertDialog key={g}>
                  <AlertDialogTrigger asChild>
                    <button className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80', getTagColorClass(g))}>
                      {g} <X className="h-3 w-3" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Retirer le tag "{g}" ?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Non</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeGroup.mutate({ terminalId: id!, groupName: g })}>Oui</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setAddTagsOpen(true)} className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs border border-dashed border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Ajouter un tag</TooltipContent>
              </Tooltip>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Système live */}
      {sysError && !sysInfo && (
        <Alert variant="warning">
          <AlertDescription>SSH indisponible — {sysError}</AlertDescription>
        </Alert>
      )}

      {detailsLoading && !sysInfo && (
        <Card>
          <CardHeader><CardTitle className="text-base">Système (live)</CardTitle></CardHeader>
          <CardContent><Skeleton className="h-32" /></CardContent>
        </Card>
      )}

      {sysInfo && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Système (live)</CardTitle></CardHeader>
            <CardContent>
              <DescriptionGrid items={[
                { label: 'Hostname', value: sysInfo.hostname },
                { label: 'OS', value: sysInfo.os },
                { label: 'Kernel', value: sysInfo.kernel },
                { label: 'Architecture', value: sysInfo.arch },
                { label: 'CPU', value: sysInfo.cpu_model },
                { label: 'Cœurs', value: sysInfo.cpu_cores },
                { label: 'Load avg', value: sysInfo.load_avg },
                { label: 'Uptime', value: sysInfo.uptime },
              ]} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">RAM</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{toGB(sysInfo.ram_used_mb)} Go <span className="text-sm font-normal text-muted-foreground">/ {toGB(sysInfo.ram_total_mb)} Go</span></p>
                <Progress value={ramPercent} indicatorClassName={getProgressColor(ramPercent)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Disque /</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{sysInfo.disk_used} <span className="text-sm font-normal text-muted-foreground">/ {sysInfo.disk_total}</span></p>
                <Progress value={diskPercent} indicatorClassName={getProgressColor(diskPercent)} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <AddTagsModal terminal={addTagsOpen ? (terminal ?? null) : null} groups={groups} onClose={() => setAddTagsOpen(false)} />

      <SshTerminal terminal={terminal ?? null} open={sshOpen} onClose={() => setSshOpen(false)} />

      <Dialog open={playbookOpen} onOpenChange={setPlaybookOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lancer un playbook sur {terminal?.name}</DialogTitle></DialogHeader>
          <Form {...playbookForm}>
            <form onSubmit={playbookForm.handleSubmit(onLaunchPlaybook)} className="space-y-4">
              <FormField control={playbookForm.control} name="playbook" render={({ field }) => (
                <FormItem>
                  <FormLabel>Playbook</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un playbook" /></SelectTrigger></FormControl>
                    <SelectContent>{playbooks.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Alert variant={isUnconfigured ? 'warning' : 'info'}>
                <AlertDescription>
                  {isUnconfigured
                    ? "Ce terminal est Non configuré — un playbook réussi retirera automatiquement ce statut."
                    : "Le playbook sera exécuté uniquement sur ce terminal."}
                </AlertDescription>
              </Alert>
              <Button type="submit" className="w-full" isLoading={launchPlaybook.isPending}>
                <Play className="h-4 w-4" /> Lancer
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
