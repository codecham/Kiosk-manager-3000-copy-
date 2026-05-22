import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ComponentSection from './ComponentSection';

const OverlaySection = () => (
  <ComponentSection title="Overlays" description="Dialog, AlertDialog, Popover, Tooltip">
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">Ouvrir Dialog</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Titre du dialog</DialogTitle>
          <DialogDescription>Contenu d'exemple à l'intérieur d'un Dialog.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>

    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="destructive">Confirmation</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Popover>
      <PopoverTrigger asChild><Button variant="outline">Ouvrir Popover</Button></PopoverTrigger>
      <PopoverContent>Contenu d'un popover.</PopoverContent>
    </Popover>

    <Tooltip>
      <TooltipTrigger asChild><Button variant="outline">Survoler (Tooltip)</Button></TooltipTrigger>
      <TooltipContent>Texte d'aide</TooltipContent>
    </Tooltip>
  </ComponentSection>
);

export default OverlaySection;