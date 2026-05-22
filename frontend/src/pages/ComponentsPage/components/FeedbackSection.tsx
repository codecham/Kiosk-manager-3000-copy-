import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import ComponentSection from './ComponentSection';

const FeedbackSection = () => (
  <ComponentSection title="Feedback" description="Alert, Progress, Skeleton">
    <div className="w-full space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Attention</AlertTitle>
        <AlertDescription>Ceci est un message d'alerte par défaut.</AlertDescription>
      </Alert>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Progress (60%)</p>
        <Progress value={60} />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Skeleton (placeholders de chargement)</p>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  </ComponentSection>
);

export default FeedbackSection;