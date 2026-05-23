import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import ActionsSection from './sections/ActionsSection';
import FormsSection from './sections/FormsSection';
import DisplaySection from './sections/DisplaySection';
import FeedbackSection from './sections/FeedbackSection';
import NavigationSection from './sections/NavigationSection';
import OverlaysSection from './sections/OverlaysSection';
import LayoutSection from './sections/LayoutSection';
import ChartsSection from './sections/ChartsSection';
import MetierSection from './sections/MetierSection';

interface NavCategory {
  id: string;
  label: string;
  count: number;
}

const NAV_CATEGORIES: NavCategory[] = [
  { id: 'actions',     label: 'Actions',     count: 4 },
  { id: 'formulaires', label: 'Formulaires', count: 10 },
  { id: 'affichage',   label: 'Affichage',   count: 8 },
  { id: 'feedback',    label: 'Feedback',    count: 6 },
  { id: 'navigation',  label: 'Navigation',  count: 4 },
  { id: 'overlays',    label: 'Overlays',    count: 9 },
  { id: 'mise-en-page',label: 'Mise en page',count: 5 },
  { id: 'charts',      label: 'Charts',      count: 6 },
  { id: 'metier',      label: 'Métier',      count: 3 },
];

const NAV_BAR_HEIGHT = 45;

const useActiveSection = (ids: string[], scrollContainer: HTMLElement | null): string => {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    if (!scrollContainer) return;

    const handleScroll = (): void => {
      const scrollTop = scrollContainer.scrollTop + NAV_BAR_HEIGHT + 16;
      let currentId = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= scrollTop) currentId = id;
      }
      setActiveId(currentId);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [ids, scrollContainer]);

  return activeId;
};

const scrollToSection = (id: string, scrollContainer: HTMLElement | null): void => {
  if (!scrollContainer) return;
  const el = document.getElementById(id);
  if (!el) return;
  scrollContainer.scrollTo({
    top: el.offsetTop - NAV_BAR_HEIGHT - 16,
    behavior: 'smooth',
  });
};

const centerActiveNavButton = (nav: HTMLDivElement, activeId: string): void => {
  const activeBtn = nav.querySelector<HTMLElement>(`[data-id="${activeId}"]`);
  if (!activeBtn) return;
  const targetScrollLeft =
    activeBtn.offsetLeft - nav.offsetWidth / 2 + activeBtn.offsetWidth / 2;
  nav.scrollLeft = Math.max(0, targetScrollLeft);
};

export default function ComponentsPage() {
  const sectionIds = NAV_CATEGORIES.map((c) => c.id);
  const navRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const main = pageRef.current?.closest('main') as HTMLElement | null;
    setScrollContainer(main);
  }, []);

  const activeSection = useActiveSection(sectionIds, scrollContainer);

  useEffect(() => {
    if (!navRef.current) return;
    centerActiveNavButton(navRef.current, activeSection);
  }, [activeSection]);

  return (
    <div ref={pageRef} className="-mx-6 -mt-6">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Design System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d'ensemble des {NAV_CATEGORIES.reduce((acc, c) => acc + c.count, 0)} composants disponibles.
        </p>
      </div>

      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div ref={navRef} className="flex gap-1 overflow-x-auto px-6 py-2 scrollbar-none">
          {NAV_CATEGORIES.map(({ id, label, count }) => (
            <button
              key={id}
              data-id={id}
              data-active={activeSection === id}
              onClick={() => scrollToSection(id, scrollContainer)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors shrink-0',
                activeSection === id
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {label}
              <span className={cn(
                'text-xs tabular-nums rounded px-1',
                activeSection === id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 space-y-16 pb-16">
        <ActionsSection />
        <FormsSection />
        <DisplaySection />
        <FeedbackSection />
        <NavigationSection />
        <OverlaysSection />
        <LayoutSection />
        <ChartsSection />
        <MetierSection />
      </div>
    </div>
  );
}