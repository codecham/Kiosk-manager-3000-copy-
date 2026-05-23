import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export type InfoCardColor = 'default' | 'primary' | 'success' | 'warning' | 'info' | 'destructive';

export interface InfoCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ElementType;
  color?: InfoCardColor;
  trend?: ReactNode;
  className?: string;
}

const COLOR_CLASSES: Record<InfoCardColor, string> = {
  default:     'bg-muted text-foreground',
  primary:     'bg-primary/15 text-primary',
  success:     'bg-success/15 text-success',
  warning:     'bg-warning/15 text-warning',
  info:        'bg-info/15 text-info',
  destructive: 'bg-destructive/15 text-destructive',
};

const InfoCard = ({
  title,
  value,
  description,
  icon: Icon,
  color = 'default',
  trend,
  className,
}: InfoCardProps) => (
  <Card className={cn('', className)}>
    <CardContent className="flex items-center justify-between gap-4 p-5">
      <div className="space-y-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{title}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
        {trend && <div className="pt-0.5">{trend}</div>}
      </div>
      <div className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
        COLOR_CLASSES[color],
      )}>
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);

export default InfoCard;