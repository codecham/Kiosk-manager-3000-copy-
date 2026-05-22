import { Badge } from '@/components/ui/badge';
import ComponentSection from './ComponentSection';

const BadgesSection = () => (
  <ComponentSection title="Badges" description="Étiquettes de statut">
    <Badge>Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="success">Success</Badge>
    <Badge variant="warning">Warning</Badge>
    <Badge variant="info">Info</Badge>
  </ComponentSection>
);

export default BadgesSection;