import { ChevronDown } from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ResizableHandle, ResizablePanel, ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';

const TERMINAL_LIST = [
  'kiosk-paris-01', 'kiosk-paris-02', 'kiosk-lyon-01', 'kiosk-lyon-02',
  'srv-backup-01', 'srv-db-01', 'srv-web-01', 'srv-web-02',
  'dev-station-01', 'dev-station-02', 'staging-01', 'staging-02',
];

const LayoutSection = () => (
  <SectionWrapper id="mise-en-page" title="Mise en page" description="Accordéons, panneaux redimensionnables, zones de scroll et carousels.">
    <ComponentBlock title="Accordion — type single" vertical>
      <Accordion type="single" collapsible className="w-full max-w-md">
        <AccordionItem value="ssh">
          <AccordionTrigger>Configuration SSH</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Clé : ~/.ssh/cpas_rsa</p>
              <p>Utilisateur : console</p>
              <p>Port par défaut : 22</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="ansible">
          <AccordionTrigger>Configuration Ansible</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Inventaire : dynamique via /api/inventory</p>
              <p>Timeout : 30s</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="groups">
          <AccordionTrigger>Groupes (3)</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Production · Staging · Développement</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ComponentBlock>

    <ComponentBlock title="Collapsible" vertical>
      <Collapsible className="w-full max-w-md space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Filtres avancés</p>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2 text-sm text-muted-foreground">
          <Separator />
          <p>Statut : En ligne / Hors ligne / Inconnu</p>
          <p>Groupe : Production / Staging / Dev</p>
          <p>OS : Ubuntu / Debian / CentOS</p>
        </CollapsibleContent>
      </Collapsible>
    </ComponentBlock>

    <ComponentBlock title="ResizablePanel" vertical>
      <div className="w-full max-w-lg h-32 rounded-lg overflow-hidden border">
        <ResizablePanelGroup>
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="flex h-full items-center justify-center p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground">Panneau gauche</p>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            <div className="flex h-full items-center justify-center p-4">
              <p className="text-xs text-muted-foreground">Panneau droit</p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ComponentBlock>

    <ComponentBlock title="ScrollArea">
      <ScrollArea className="h-48 w-64 rounded-md border">
        <div className="p-4 space-y-2">
          <p className="text-sm font-medium mb-3">Terminaux ({TERMINAL_LIST.length})</p>
          {TERMINAL_LIST.map((name) => (
            <div key={name} className="text-sm text-muted-foreground py-1 border-b border-border/50 last:border-0">
              {name}
            </div>
          ))}
        </div>
      </ScrollArea>
    </ComponentBlock>

    <ComponentBlock title="Carousel">
      <div className="w-full max-w-xs">
        <Carousel>
          <CarouselContent>
            {[1, 2, 3, 4, 5].map((i) => (
              <CarouselItem key={i}>
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-2xl font-semibold text-muted-foreground">{i}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </ComponentBlock>
  </SectionWrapper>
);

export default LayoutSection;
