import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ComponentSection from './ComponentSection';

const DataDisplaySection = () => (
  <ComponentSection title="Affichage de données" description="Avatar, Separator, Tabs, Table">
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
      </div>

      <Separator />

      <Tabs defaultValue="apercu">
        <TabsList>
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>
        <TabsContent value="apercu" className="text-sm text-muted-foreground pt-2">Contenu de l'onglet Aperçu.</TabsContent>
        <TabsContent value="details" className="text-sm text-muted-foreground pt-2">Contenu de l'onglet Détails.</TabsContent>
      </Tabs>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell>kiosk-01</TableCell><TableCell>En ligne</TableCell></TableRow>
          <TableRow><TableCell>kiosk-02</TableCell><TableCell>Hors ligne</TableCell></TableRow>
        </TableBody>
      </Table>
    </div>
  </ComponentSection>
);

export default DataDisplaySection;