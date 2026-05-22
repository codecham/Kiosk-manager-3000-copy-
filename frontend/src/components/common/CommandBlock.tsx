import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CommandBlockProps {
  command: string;
}

export default function CommandBlock({ command }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3 mt-2 bg-[#1e1e1e] rounded-md p-3">
      <code className="flex-1 text-[#a8ff78] text-xs break-all leading-relaxed font-mono">{command}</code>
      <Button
        size="sm"
        onClick={handleCopy}
        className={cn('shrink-0 border-none text-white', copied ? 'bg-green-600 hover:bg-green-600' : 'bg-[#333] hover:bg-[#444]')}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copié !' : 'Copier'}
      </Button>
    </div>
  );
}
