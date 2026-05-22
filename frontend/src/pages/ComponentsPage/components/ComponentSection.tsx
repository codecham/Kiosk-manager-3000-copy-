import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComponentSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const ComponentSection = ({ title, description, children }: ComponentSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardHeader>
    <CardContent className="flex flex-wrap items-start gap-4">{children}</CardContent>
  </Card>
);

export default ComponentSection;