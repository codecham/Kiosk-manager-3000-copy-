import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Terminal as TerminalModel } from '@/types/models.types';

interface SshTerminalProps {
  terminal: TerminalModel | null;
  open: boolean;
  onClose: () => void;
}

const XTERM_THEME = {
  background: '#1a1a1a',
  foreground: '#d4d4d4',
  cursor: '#a8ff78',
  selectionBackground: '#264f78',
};

const buildWsUrl = (terminalId: string): string => {
  const token = localStorage.getItem('token');
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/api/terminals/${terminalId}/ssh?token=${token}`;
};

export default function SshTerminal({ terminal, open, onClose }: SshTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!open || !terminal || !containerRef.current) return;

    const xterm = new Terminal({
      theme: XTERM_THEME,
      fontFamily: '"Cascadia Code", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(containerRef.current);
    setTimeout(() => fitAddon.fit(), 200);

    xtermRef.current = xterm;
    fitRef.current = fitAddon;

    const ws = new WebSocket(buildWsUrl(terminal.id));
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: 'resize', cols: xterm.cols, rows: xterm.rows }));
    ws.onmessage = (e) => xterm.write(e.data as string);
    ws.onclose = () => xterm.write('\r\n\x1b[33m[Session SSH terminée]\x1b[0m\r\n');
    ws.onerror = () => xterm.write('\r\n\x1b[31m[Erreur de connexion WebSocket]\x1b[0m\r\n');

    xterm.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data);
    });

    const handleResize = () => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols: xterm.cols, rows: xterm.rows }));
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      xterm.dispose();
      xtermRef.current = null;
      wsRef.current = null;
      fitRef.current = null;
    };
  }, [open, terminal]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[85vw] p-0 bg-[#1a1a1a] border-[#444]">
        <DialogHeader className="px-4 py-3 bg-[#2d2d2d] border-b border-[#444]">
          <DialogTitle className="text-[#d4d4d4] text-sm font-mono">
            SSH — {terminal?.name} ({terminal?.hostname})
          </DialogTitle>
        </DialogHeader>
        <div ref={containerRef} className="h-[65vh] bg-[#1a1a1a] px-1 py-2" />
      </DialogContent>
    </Dialog>
  );
}
