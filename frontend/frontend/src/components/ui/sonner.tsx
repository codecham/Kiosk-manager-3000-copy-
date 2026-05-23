import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from 'lucide-react';

const TOAST_STYLES = {
  '--normal-bg':        'var(--popover)',
  '--normal-text':      'var(--popover-foreground)',
  '--normal-border':    'var(--border)',

  '--success-bg':       'var(--success)',
  '--success-text':     'var(--success-foreground)',
  '--success-border':   'var(--success)',

  '--warning-bg':       'var(--warning)',
  '--warning-text':     'var(--warning-foreground)',
  '--warning-border':   'var(--warning)',

  '--info-bg':          'var(--info)',
  '--info-text':        'var(--info-foreground)',
  '--info-border':      'var(--info)',

  '--error-bg':         'var(--destructive)',
  '--error-text':       'var(--destructive-foreground)',
  '--error-border':     'var(--destructive)',

  '--border-radius':    'var(--radius)',
} as React.CSSProperties;

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useTheme();

  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info:    <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error:   <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={TOAST_STYLES}
      {...props}
    />
  );
};

export { Toaster };