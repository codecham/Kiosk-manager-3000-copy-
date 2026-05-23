import { Home, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';

const NavigationSection = () => (
  <SectionWrapper id="navigation" title="Navigation" description="Tabs, breadcrumbs, pagination et menus de navigation.">
    <ComponentBlock title="Tabs — variantes" vertical>
      <Tabs defaultValue="overview" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="history" disabled>Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="text-sm text-muted-foreground p-2">
          Informations générales du terminal.
        </TabsContent>
        <TabsContent value="system" className="text-sm text-muted-foreground p-2">
          CPU, RAM, disque en temps réel.
        </TabsContent>
        <TabsContent value="logs" className="text-sm text-muted-foreground p-2">
          Journaux système.
        </TabsContent>
      </Tabs>
    </ComponentBlock>

    <ComponentBlock title="Breadcrumb" vertical>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#"><Home className="h-3.5 w-3.5" /></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-3.5 w-3.5" /></BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Terminaux</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-3.5 w-3.5" /></BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>kiosk-paris-01</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </ComponentBlock>

    <ComponentBlock title="Pagination">
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
          <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
          <PaginationItem><PaginationEllipsis /></PaginationItem>
          <PaginationItem><PaginationLink href="#">8</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#" /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </ComponentBlock>

    <ComponentBlock title="NavigationMenu">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Terminaux</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-48 p-2 space-y-1">
                <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                  Tous les terminaux
                </NavigationMenuLink>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                  Par groupe
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Playbooks</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-48 p-2 space-y-1">
                <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                  Exécuter
                </NavigationMenuLink>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                  Historique
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
              Dashboard
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </ComponentBlock>
  </SectionWrapper>
);

export default NavigationSection;
