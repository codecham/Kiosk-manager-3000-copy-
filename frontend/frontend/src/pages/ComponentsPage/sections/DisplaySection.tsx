import { Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Kbd } from '@/components/ui/kbd';
import { Spinner } from '@/components/ui/spinner';
// import { Button } from '@/components/ui/button';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';

const DisplaySection = () => (
  <SectionWrapper id="affichage" title="Affichage" description="Composants de présentation des données et du contenu.">
    <ComponentBlock title="Badge — variantes">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </ComponentBlock>

    <ComponentBlock title="Avatar">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
      </Avatar>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar className="h-12 w-12">
        <AvatarFallback className="text-lg">LG</AvatarFallback>
      </Avatar>
    </ComponentBlock>

    <ComponentBlock title="Card — variantes" vertical>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              kiosk-paris-01
            </CardTitle>
            <CardDescription>192.168.1.10 · Port 22</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ubuntu 22.04 LTS · x86_64</p>
          </CardContent>
          <CardFooter className="gap-2">
            <Badge variant="default">En ligne</Badge>
            <Badge variant="outline">Production</Badge>
          </CardFooter>
        </Card>

        <Card className="border-dashed bg-muted/20">
          <CardHeader>
            <CardTitle className="text-muted-foreground">Card dashed</CardTitle>
            <CardDescription>Variante pour zones vides ou ajout</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Contenu secondaire.</p>
          </CardContent>
        </Card>
      </div>
    </ComponentBlock>

    <ComponentBlock title="Table">
      <div className="w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Terminal</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">kiosk-paris-01</TableCell>
              <TableCell>192.168.1.10</TableCell>
              <TableCell>Ubuntu 22.04</TableCell>
              <TableCell><Badge variant="default">En ligne</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">kiosk-lyon-02</TableCell>
              <TableCell>192.168.1.11</TableCell>
              <TableCell>Debian 12</TableCell>
              <TableCell><Badge variant="destructive">Hors ligne</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">srv-backup-01</TableCell>
              <TableCell>10.0.0.5</TableCell>
              <TableCell>CentOS 9</TableCell>
              <TableCell><Badge variant="outline">Inconnu</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </ComponentBlock>

    <ComponentBlock title="Separator">
      <div className="w-full space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">Horizontal</p>
          <Separator />
          <p className="text-xs text-muted-foreground">Contenu après le séparateur</p>
        </div>
        <div className="flex items-center gap-4 h-8">
          <span className="text-sm">Gauche</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Droite</span>
        </div>
      </div>
    </ComponentBlock>

    <ComponentBlock title="Kbd — raccourcis clavier">
      <div className="flex items-center gap-2 text-sm">
        <Kbd>⌘</Kbd><span>+</span><Kbd>K</Kbd><span>Recherche</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Kbd>Ctrl</Kbd><span>+</span><Kbd>S</Kbd><span>Sauvegarder</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Kbd>Échap</Kbd><span>Fermer</span>
      </div>
    </ComponentBlock>

    <ComponentBlock title="Spinner — tailles">
      <Spinner />
    </ComponentBlock>
  </SectionWrapper>
);

export default DisplaySection;
