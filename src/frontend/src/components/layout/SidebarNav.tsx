import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  AlertTriangle, 
  FileBarChart, 
  ClipboardList,
  Users,
  Home
} from 'lucide-react';
import { AppRole } from '../../backend';

interface SidebarNavProps {
  onNavigate?: () => void;
}

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { appRole } = useCurrentUser();
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
      label: 'Home',
      icon: Home,
      path: '/',
      roles: [AppRole.seller, AppRole.buyer, AppRole.admin],
    },
    {
      label: 'Invoices',
      icon: FileText,
      path: '/invoices',
      roles: [AppRole.seller, AppRole.buyer, AppRole.admin],
    },
    {
      label: 'Inventory',
      icon: Package,
      path: '/inventory',
      roles: [AppRole.seller, AppRole.admin],
    },
    {
      label: 'Low Stock Alerts',
      icon: AlertTriangle,
      path: '/inventory/low-stock',
      roles: [AppRole.seller, AppRole.admin],
    },
    {
      label: 'GST Returns',
      icon: FileBarChart,
      path: '/gst-returns',
      roles: [AppRole.seller, AppRole.admin],
    },
    {
      label: 'Audit Logs',
      icon: ClipboardList,
      path: '/audit',
      roles: [AppRole.admin],
    },
    {
      label: 'Role Management',
      icon: Users,
      path: '/admin/roles',
      roles: [AppRole.admin],
    },
  ];

  const visibleItems = navItems.filter(item => 
    appRole && item.roles.includes(appRole)
  );

  return (
    <nav className="p-4 space-y-2">
      <div className="mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Navigation
        </h2>
        <Separator />
      </div>
      
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <Button
            key={item.path}
            variant={active ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => handleNavigate(item.path)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
