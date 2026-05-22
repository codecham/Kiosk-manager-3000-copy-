import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ComponentSection from './ComponentSection';

const FormSection = () => (
  <ComponentSection title="Formulaires" description="Input, Label, Checkbox, Select">
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="demo-input">Nom du terminal</Label>
        <Input id="demo-input" placeholder="Ex. kiosk-paris-01" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="demo-select">Groupe</Label>
        <Select>
          <SelectTrigger id="demo-select"><SelectValue placeholder="Choisir un groupe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="prod">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="dev">Développement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="demo-checkbox" />
        <Label htmlFor="demo-checkbox">Activer les mises à jour automatiques</Label>
      </div>
    </div>
  </ComponentSection>
);

export default FormSection;