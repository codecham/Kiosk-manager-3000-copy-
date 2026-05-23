import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Calendar } from '@/components/ui/calendar';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';

const FormsSection = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sliderValue, setSliderValue] = useState([40]);

  return (
    <SectionWrapper id="formulaires" title="Formulaires" description="Inputs, selects, checkboxes et autres contrôles de saisie.">
      <ComponentBlock title="Input — variantes" vertical>
        <div className="w-full max-w-sm space-y-3">
          <Input placeholder="Placeholder par défaut" />
          <Input defaultValue="Valeur pré-remplie" />
          <Input type="password" defaultValue="motdepasse" />
          <Input disabled placeholder="Désactivé" />
          <Input className="border-destructive focus-visible:ring-destructive" placeholder="Erreur de validation" />
        </div>
      </ComponentBlock>

      <ComponentBlock title="Label + Input" vertical>
        <div className="w-full max-w-sm space-y-2">
          <Label htmlFor="hostname">Hostname</Label>
          <Input id="hostname" placeholder="192.168.1.1" />
        </div>
        <div className="w-full max-w-sm space-y-2">
          <Label htmlFor="port">Port <span className="text-destructive">*</span></Label>
          <Input id="port" type="number" defaultValue="22" />
        </div>
      </ComponentBlock>

      <ComponentBlock title="Textarea">
        <Textarea className="w-full max-w-sm" placeholder="Notes sur ce terminal..." rows={4} />
        <Textarea className="w-full max-w-sm" disabled placeholder="Désactivé" rows={2} />
      </ComponentBlock>

      <ComponentBlock title="Select">
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Choisir un groupe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prod">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="dev">Développement</SelectItem>
          </SelectContent>
        </Select>
        <Select disabled>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Désactivé" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="x">Option</SelectItem>
          </SelectContent>
        </Select>
      </ComponentBlock>

      <ComponentBlock title="Checkbox">
        <div className="flex items-center gap-2">
          <Checkbox id="chk1" />
          <Label htmlFor="chk1">Non coché</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="chk2" defaultChecked />
          <Label htmlFor="chk2">Coché</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="chk3" disabled />
          <Label htmlFor="chk3" className="text-muted-foreground">Désactivé</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="chk4" defaultChecked disabled />
          <Label htmlFor="chk4" className="text-muted-foreground">Coché désactivé</Label>
        </div>
      </ComponentBlock>

      <ComponentBlock title="RadioGroup" vertical>
        <RadioGroup defaultValue="ssh-key">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="ssh-key" id="r1" />
            <Label htmlFor="r1">Clé SSH</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="password" id="r2" />
            <Label htmlFor="r2">Mot de passe</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="agent" id="r3" disabled />
            <Label htmlFor="r3" className="text-muted-foreground">Agent SSH (bientôt)</Label>
          </div>
        </RadioGroup>
      </ComponentBlock>

      <ComponentBlock title="Switch">
        <div className="flex items-center gap-2">
          <Switch id="sw1" />
          <Label htmlFor="sw1">Désactivé</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sw2" defaultChecked />
          <Label htmlFor="sw2">Activé</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sw3" disabled />
          <Label htmlFor="sw3" className="text-muted-foreground">Désactivé (disabled)</Label>
        </div>
      </ComponentBlock>

      <ComponentBlock title="Slider" vertical>
        <div className="w-full max-w-sm space-y-2">
          <Label>CPU limit : {sliderValue[0]}%</Label>
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            max={100}
            step={1}
          />
        </div>
        <div className="w-full max-w-sm space-y-2">
          <Label>Désactivé</Label>
          <Slider defaultValue={[60]} max={100} disabled />
        </div>
      </ComponentBlock>

      <ComponentBlock title="InputOTP">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </ComponentBlock>

      <ComponentBlock title="Calendar">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </ComponentBlock>
    </SectionWrapper>
  );
};

export default FormsSection;
