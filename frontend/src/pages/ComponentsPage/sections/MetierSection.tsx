import { useState } from 'react';
import { Monitor, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SshTerminal from '@/components/common/SshTerminal';
import TerminalListModal from '@/components/common/TerminalListModal';
import InfoCard from '@/components/common/InfoCard';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';
import type { Terminal as TerminalModel } from '@/types/models.types';

const MOCK_TERMINALS: TerminalModel[] = [
  { id: '1', name: 'kiosk-paris-01', hostname: '192.168.1.10', port: 22, username: 'console', status: 'online',  groups: ['production'], os_version: 'Ubuntu 22.04' },
  { id: '2', name: 'kiosk-lyon-02',  hostname: '192.168.1.11', port: 22, username: 'console', status: 'offline', groups: ['production'], os_version: 'Debian 12' },
  { id: '3', name: 'srv-backup-01',  hostname: '10.0.0.5',     port: 22, username: 'console', status: 'unknown', groups: ['infra'],       os_version: 'CentOS 9' },
];

const MOCK_SSH_TERMINAL: TerminalModel = MOCK_TERMINALS[0];

const MetierSection = () => {
  const [sshOpen, setSshOpen]             = useState(false);
  const [terminalListOpen, setTerminalListOpen] = useState(false);

  return (
    <SectionWrapper
      id="metier"
      title="Composants métier"
      description="Composants spécifiques à CPAS Manager — terminaux, SSH, groupes."
    >
      <ComponentBlock title="InfoCard — toutes les couleurs" vertical>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <InfoCard title="Terminaux"  value={24} description="Machines enregistrées" icon={Monitor} color="primary"     />
          <InfoCard title="En ligne"   value={21} description="87% de disponibilité"  icon={Monitor} color="success"     />
          <InfoCard title="Hors ligne" value={3}  description="Vérification requise"  icon={Monitor} color="destructive" />
          <InfoCard title="Groupes"    value={5}  description="Groupes de terminaux"  icon={Monitor} color="info"        />
          <InfoCard title="Playbooks"  value={12} description="Cette semaine"         icon={Monitor} color="warning"     />
          <InfoCard title="Inconnus"   value={2}                                       icon={Monitor} color="default"     />
        </div>
      </ComponentBlock>

      <ComponentBlock title="TerminalListModal">
        <Button variant="outline" onClick={() => setTerminalListOpen(true)}>
          <Monitor />
          Voir les terminaux
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {MOCK_TERMINALS.map((t) => (
            <Badge
              key={t.id}
              variant={t.status === 'online' ? 'success' : t.status === 'offline' ? 'destructive' : 'warning'}
            >
              {t.name}
            </Badge>
          ))}
        </div>
        <TerminalListModal
          open={terminalListOpen}
          title={<><Monitor className="h-4 w-4" /> Terminaux de production</>}
          terminals={MOCK_TERMINALS}
          onClose={() => setTerminalListOpen(false)}
        />
      </ComponentBlock>

      <ComponentBlock title="SshTerminal" vertical>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Le terminal SSH s'ouvre via WebSocket vers le backend. La connexion échoue en démo
            (pas de backend actif), mais la modale et l'UI xterm sont bien rendus.
          </p>
          <Button variant="outline" onClick={() => setSshOpen(true)}>
            <Terminal />
            Ouvrir SSH — {MOCK_SSH_TERMINAL.name}
          </Button>
        </div>
        <SshTerminal
          terminal={MOCK_SSH_TERMINAL}
          open={sshOpen}
          onClose={() => setSshOpen(false)}
        />
      </ComponentBlock>
    </SectionWrapper>
  );
};

export default MetierSection;