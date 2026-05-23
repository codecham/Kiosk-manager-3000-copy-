import { Terminal, Trash2, Settings, LogOut, Copy, Edit, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
  ContextMenuShortcut, ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';

const OverlaysSection = () => (
  <SectionWrapper id="overlays" title="Overlays" description="Modals, panneaux latéraux, menus et composants flottants.">
    <ComponentBlock title="Dialog">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Ouvrir Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un terminal</DialogTitle>
            <DialogDescription>Renseignez les informations de connexion SSH.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Contenu du formulaire ici.</p>
          <DialogFooter>
            <Button variant="outline">Annuler</Button>
            <Button>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ComponentBlock>

    <ComponentBlock title="AlertDialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" />Supprimer</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer kiosk-paris-01 ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le terminal sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ComponentBlock>

    <ComponentBlock title="Sheet — côtés">
      {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">{side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Panneau {side}</SheetTitle>
              <SheetDescription>Configuration du terminal.</SheetDescription>
            </SheetHeader>
            <div className="py-4 text-sm text-muted-foreground">Contenu du panneau latéral.</div>
            <SheetFooter>
              <Button size="sm">Enregistrer</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </ComponentBlock>

    <ComponentBlock title="Drawer">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Ouvrir Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Lancer un playbook</DrawerTitle>
            <DrawerDescription>Sélectionnez les cibles et confirmez l'exécution.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 text-sm text-muted-foreground">Contenu du drawer.</div>
          <DrawerFooter>
            <Button>Exécuter</Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ComponentBlock>

    <ComponentBlock title="DropdownMenu">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>kiosk-paris-01</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><Terminal className="h-4 w-4 mr-2" />Ouvrir SSH</DropdownMenuItem>
          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Modifier</DropdownMenuItem>
          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Dupliquer</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ComponentBlock>

    <ComponentBlock title="ContextMenu — clic droit sur la zone">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-16 w-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Faites un clic droit ici
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem><Terminal className="h-4 w-4 mr-2" />Ouvrir SSH<ContextMenuShortcut>⌘T</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem><Edit className="h-4 w-4 mr-2" />Modifier</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Supprimer</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </ComponentBlock>

    <ComponentBlock title="Popover">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Infos système</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2 text-sm">
            <p className="font-medium">kiosk-paris-01</p>
            <div className="text-muted-foreground space-y-1">
              <p>CPU : 68% · 4 cœurs</p>
              <p>RAM : 2.1 / 8 GB</p>
              <p>Uptime : 12j 4h</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </ComponentBlock>

    <ComponentBlock title="HoverCard">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">kiosk-paris-01</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-72">
          <div className="flex justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">kiosk-paris-01</h4>
              <p className="text-xs text-muted-foreground">Ubuntu 22.04 · 192.168.1.10</p>
              <div className="flex gap-1 pt-1">
                <Badge variant="default">En ligne</Badge>
                <Badge variant="outline">Production</Badge>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </ComponentBlock>

    <ComponentBlock title="Tooltip">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon"><Terminal className="h-4 w-4" /></Button>
        </TooltipTrigger>
        <TooltipContent>Ouvrir un terminal SSH</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Paramètres</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" disabled><LogOut className="h-4 w-4" /></Button>
        </TooltipTrigger>
        <TooltipContent>Déconnexion (désactivé)</TooltipContent>
      </Tooltip>
    </ComponentBlock>

    <ComponentBlock title="Command — palette de commandes" vertical>
      <div className="w-full max-w-sm rounded-lg border shadow-md overflow-hidden">
        <Command>
          <CommandInput placeholder="Rechercher un terminal, playbook..." />
          <CommandList>
            <CommandEmpty>Aucun résultat.</CommandEmpty>
            <CommandGroup heading="Terminaux">
              <CommandItem><Terminal className="mr-2 h-4 w-4" />kiosk-paris-01</CommandItem>
              <CommandItem><Terminal className="mr-2 h-4 w-4" />kiosk-lyon-02</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Playbooks">
              <CommandItem><Settings className="mr-2 h-4 w-4" />update-packages.yml</CommandItem>
              <CommandItem><Settings className="mr-2 h-4 w-4" />deploy-nginx.yml</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </ComponentBlock>
  </SectionWrapper>
);

export default OverlaysSection;
