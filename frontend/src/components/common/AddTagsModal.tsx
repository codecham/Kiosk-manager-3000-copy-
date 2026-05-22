import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAddTerminalGroup } from '@/hooks/useTerminals';
import { getTagColorClass } from '@/utils/tagColors';
import { UNCONFIGURED_TAG } from '@/lib/constants';
import type { Terminal, Group } from '@/types/models.types';

interface AddTagsModalProps {
  terminal: Terminal | null;
  groups: Group[];
  onClose: () => void;
}

export default function AddTagsModal({ terminal, groups, onClose }: AddTagsModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const addGroup = useAddTerminalGroup();

  const available = terminal
    ? groups.filter((g) => !terminal.groups.includes(g.name) && g.name !== UNCONFIGURED_TAG)
    : [];

  const handleConfirm = async () => {
    if (!terminal || selected.length === 0) return;
    await Promise.all(selected.map((name) => addGroup.mutateAsync({ terminalId: terminal.id, groupName: name })));
    onClose();
    setSelected([]);
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  return (
    <Dialog open={!!terminal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter des tags</DialogTitle>
        </DialogHeader>
        {available.length === 0 ? (
          <p className="text-muted-foreground text-sm">Tous les tags disponibles sont déjà assignés à ce terminal.</p>
        ) : (
          <div className="space-y-2 py-1">
            {available.map((g) => (
              <label key={g.name} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={selected.includes(g.name)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) => checked ? [...prev, g.name] : prev.filter((n) => n !== g.name))
                  }
                />
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getTagColorClass(g.name)}`}>
                  {g.name}
                </span>
                {g.terminal_count > 0 && (
                  <span className="text-xs text-muted-foreground">{g.terminal_count} terminal{g.terminal_count > 1 ? 'aux' : ''}</span>
                )}
              </label>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={selected.length === 0} isLoading={addGroup.isPending}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
