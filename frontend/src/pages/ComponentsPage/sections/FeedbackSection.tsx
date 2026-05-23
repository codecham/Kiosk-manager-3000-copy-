import { AlertCircle, CheckCircle2, Info, AlertTriangle, ServerOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import ComponentBlock from '../ComponentBlock';
import SectionWrapper from '../SectionWrapper';

const FeedbackSection = () => (
  <SectionWrapper id="feedback" title="Feedback" description="Alertes, progression, états de chargement et états vides.">
    <ComponentBlock title="Alert — variantes" vertical>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>Le terminal sera redémarré lors du prochain cycle de maintenance.</AlertDescription>
      </Alert>

      <Alert variant="default">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Connexion réussie</AlertTitle>
        <AlertDescription>SSH établi vers kiosk-paris-01 en 342ms.</AlertDescription>
      </Alert>

      <Alert variant="default">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Avertissement</AlertTitle>
        <AlertDescription>L'utilisation CPU dépasse 80% depuis 5 minutes.</AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>Impossible de se connecter à kiosk-lyon-02 : connexion refusée.</AlertDescription>
      </Alert>
    </ComponentBlock>

    <ComponentBlock title="Progress" vertical>
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>CPU</span><span>68%</span>
          </div>
          <Progress value={68} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>RAM</span><span>42%</span>
          </div>
          <Progress value={42} className="[&>div]:bg-blue-500" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Disque</span><span>91%</span>
          </div>
          <Progress value={91} className="[&>div]:bg-destructive" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ansible — déploiement en cours</span>
          </div>
          <Progress value={undefined} />
        </div>
      </div>
    </ComponentBlock>

    <ComponentBlock title="Skeleton — placeholders" vertical>
      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </ComponentBlock>
  </SectionWrapper>
);

export default FeedbackSection;
