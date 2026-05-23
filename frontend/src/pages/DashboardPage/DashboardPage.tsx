import { Monitor, Tags, CheckCircle, WifiOff, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InfoCard from '@/components/common/InfoCard';
import { useTerminals } from '@/hooks/useTerminals';
import { useGroups } from '@/hooks/useGroups';
import { useRuns } from '@/hooks/usePlaybooks';
import { formatDate } from '@/lib/utils';
import type { RunStatus } from '@/types/models.types';

const RUN_STATUS_VARIANT: Record<RunStatus, 'success' | 'destructive' | 'info' | 'warning'> = {
  success: 'success',
  failed: 'destructive',
  running: 'info',
  pending: 'warning',
};

const StatsSkeletons = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
  </div>
);

export default function DashboardPage() {
  const { data: terminals = [], isLoading: terminalsLoading } = useTerminals();
  const { data: groups = [] } = useGroups();
  const { data: runs = [] } = useRuns();

  const onlineCount = terminals.filter((t) => t.status === 'online').length;
  const offlineCount = terminals.filter((t) => t.status === 'offline').length;
  const recentRuns = runs.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Vue d'ensemble</h1>

      {terminalsLoading ? <StatsSkeletons /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            title="Terminaux"
            value={terminals.length}
            description="Machines enregistrées"
            icon={Monitor}
            color="primary"
          />
          <InfoCard
            title="En ligne"
            value={onlineCount}
            description={`${terminals.length > 0 ? Math.round(onlineCount / terminals.length * 100) : 0}% de disponibilité`}
            icon={CheckCircle}
            color="success"
          />
          <InfoCard
            title="Hors ligne"
            value={offlineCount}
            icon={WifiOff}
            color={offlineCount > 0 ? 'destructive' : 'default'}
          />
          <InfoCard
            title="Groupes"
            value={groups.length}
            description="Groupes de terminaux"
            icon={Tags}
            color="info"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
            Dernières exécutions Ansible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Playbook</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>{run.name}</TableCell>
                  <TableCell className="font-mono text-xs">{run.playbook_path}</TableCell>
                  <TableCell>
                    <Badge variant={RUN_STATUS_VARIANT[run.status]}>{run.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{formatDate(run.created_at)}</TableCell>
                </TableRow>
              ))}
              {recentRuns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Aucune exécution récente
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}