import { useNavigate } from 'react-router-dom';
import { Monitor } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TERMINAL_STATUS_HEX } from '@/utils/tagColors';
import type { Terminal } from '@/types/models.types';

interface TerminalListModalProps {
  open: boolean;
  title: React.ReactNode;
  terminals: Terminal[];
  emptyMessage?: string;
  onClose: () => void;
}

export default function TerminalListModal({ open, title, terminals, emptyMessage = 'Aucun terminal.', onClose }: TerminalListModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <span className="text-muted-foreground font-normal text-sm">
              — {terminals.length > 1 ? `${terminals.length} terminaux` : `${terminals.length} terminal`}
            </span>
          </DialogTitle>
        </DialogHeader>
        {terminals.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <ul className="space-y-2">
            {terminals.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8" style={{ background: TERMINAL_STATUS_HEX[t.status] }}>
                    <AvatarFallback className="bg-transparent text-white">
                      <Monitor className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.hostname} — {t.os_version ?? 'OS inconnu'}</p>
                  </div>
                </div>
                <Button size="sm" variant="link" onClick={() => { onClose(); navigate(`/terminals/${t.id}`); }}>
                  Détails
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
