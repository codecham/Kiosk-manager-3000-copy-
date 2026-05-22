import ButtonsSection from './components/ButtonsSection';
import BadgesSection from './components/BadgesSection';
import FormSection from './components/FormSection';
import FeedbackSection from './components/FeedbackSection';
import OverlaySection from './components/OverlaySection';
import DataDisplaySection from './components/DataDisplaySection';

export default function ComponentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Composants</h1>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble des composants UI disponibles dans le projet.
        </p>
      </div>

      <ButtonsSection />
      <BadgesSection />
      <FormSection />
      <FeedbackSection />
      <OverlaySection />
      <DataDisplaySection />
    </div>
  );
}