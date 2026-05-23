import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ComponentBlockProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  vertical?: boolean;
}

const ComponentBlock = ({ title, description, children, className, vertical = false }: ComponentBlockProps) => (
  <div className="space-y-3">
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <div
      className={cn(
        'rounded-lg border border-border bg-muted/30 p-4',
        vertical ? 'flex flex-col gap-3' : 'flex flex-wrap items-center gap-3',
        className,
      )}
    >
      {children}
    </div>
  </div>
);

export default ComponentBlock;
