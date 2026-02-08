import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Home,
  FileInput,
  Zap,
  Leaf,
  DollarSign
} from 'lucide-react';

interface SidebarNavProps {
  onNavigate?: () => void;
}

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleNavigate = (path: string) => {
    navigate({ to: path });
    onNavigate?.();
  };

  const isActive = (path: string) => currentPath === path;

  const navItems = [
    {
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
    },
    {
      label: 'Energy Inputs',
      icon: FileInput,
      path: '/inputs',
    },
    {
      label: 'Consumption',
      icon: Zap,
      path: '/consumption',
    },
    {
      label: 'Solar Analysis',
      icon: Leaf,
      path: '/solar-analysis',
    },
    {
      label: 'Cost Estimation',
      icon: DollarSign,
      path: '/cost-estimation',
    },
  ];

  return (
    <nav className="p-4 space-y-2">
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Energy Modules
        </h2>
        <Separator />
      </div>
      
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <Button
            key={item.path}
            variant={active ? 'default' : 'ghost'}
            className="w-full justify-start transition-smooth"
            onClick={() => handleNavigate(item.path)}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
