import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Monitor, Tags, PlayCircle, LogOut, ChevronLeft, ChevronRight, Component } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/terminals', icon: Monitor, label: 'Terminaux' },
  { path: '/groups', icon: Tags, label: 'Groupes' },
  { path: '/playbooks', icon: PlayCircle, label: 'Playbooks' },
  { path: '/components', icon: Component, label: 'Composants' },
] as const;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className={cn('flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200', collapsed ? 'w-16' : 'w-56')}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="font-semibold text-sm truncate">CPAS Manager 3000</span>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed((v) => !v)} className="text-sidebar-foreground hover:bg-sidebar-accent ml-auto shrink-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Tooltip key={path} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate(path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent',
                    collapsed && 'justify-center',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
            </Tooltip>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="p-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors', collapsed && 'justify-center')}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Déconnexion</span>}
            </button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Déconnexion</TooltipContent>}
        </Tooltip>
      </div>
    </aside>
  );
}
