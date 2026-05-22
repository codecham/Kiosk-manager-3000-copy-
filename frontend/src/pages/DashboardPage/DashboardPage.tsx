import { Monitor, Tags, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

const StatCard = ({ title, value, icon: Icon, valueClassName }: { title: string; value: number; icon: React.ElementType; valueClassName?: string }) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-6">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`text-2xl font-bold ${valueClassName ?? ''}`}>{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { data: terminals = [], isLoading: terminalsLoading } = useTerminals();
  const { data: groups = [] } = useGroups();
  const { data: runs = [] } = useRuns();

  const onlineCount = terminals.filter((t) => t.status === 'online').length;
  const recentRuns = runs.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Vue d'ensemble</h1>

      {terminalsLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Terminaux totaux" value={terminals.length} icon={Monitor} />
          <StatCard title="En ligne" value={onlineCount} icon={CheckCircle} valueClassName="text-green-600" />
          <StatCard title="Groupes" value={groups.length} icon={Tags} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dernières exécutions Ansible</CardTitle>
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
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Aucune exécution récente</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
