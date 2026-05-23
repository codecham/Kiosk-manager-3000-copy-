import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

interface SectionWrapperProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

const SectionWrapper = ({ id, title, description, children }: SectionWrapperProps) => (
  <section id={id} className="scroll-mt-6 space-y-6">
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    <Separator />
    <div className="space-y-8">{children}</div>
  </section>
);

export default SectionWrapper;
