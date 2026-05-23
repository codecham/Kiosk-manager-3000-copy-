import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';

const ActionsSection = () => (
  <SectionWrapper id="actions" title="Actions" description="Boutons, toggles et groupes d'actions.">
    <ComponentBlock title="Button — variantes">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </ComponentBlock>

    <ComponentBlock title="Button — tailles">
      <Button size="lg">Large</Button>
      <Button size="default">Default</Button>
      <Button size="sm">Small</Button>
      <Button size="icon" variant="outline"><Trash2 className="h-4 w-4" /></Button>
    </ComponentBlock>

    <ComponentBlock title="Button — états">
      <Button disabled>Désactivé</Button>
      <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Avec icône</Button>
      <Button variant="secondary"><Download className="h-4 w-4 mr-2" />Télécharger</Button>
    </ComponentBlock>

    <ComponentBlock title="Toggle — variantes">
      <Toggle aria-label="Gras"><Bold className="h-4 w-4" /></Toggle>
      <Toggle variant="outline" aria-label="Italique"><Italic className="h-4 w-4" /></Toggle>
      <Toggle aria-label="Souligné" defaultPressed><Underline className="h-4 w-4" /></Toggle>
      <Toggle disabled aria-label="Désactivé"><Bold className="h-4 w-4" /></Toggle>
    </ComponentBlock>

    <ComponentBlock title="ToggleGroup — alignement">
      <ToggleGroup type="single" defaultValue="center">
        <ToggleGroupItem value="left" aria-label="Gauche"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Centre"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Droite"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="multiple">
        <ToggleGroupItem value="bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
        <ToggleGroupItem value="italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
        <ToggleGroupItem value="underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
      </ToggleGroup>
    </ComponentBlock>
  </SectionWrapper>
);

export default ActionsSection;
