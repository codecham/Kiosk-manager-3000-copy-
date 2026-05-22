import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComponentSection from './ComponentSection';

const ButtonsSection = () => (
  <ComponentSection title="Boutons" description="Variantes et tailles disponibles">
    <Button>Default</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
    <Button size="icon" variant="outline"><Trash2 /></Button>
    <Button isLoading>Chargement</Button>
    <Button disabled>Désactivé</Button>
  </ComponentSection>
);

export default ButtonsSection;