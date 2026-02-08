import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Green Energy Usage Optimizer</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Solar & Energy Analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.fullName || user.email}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
