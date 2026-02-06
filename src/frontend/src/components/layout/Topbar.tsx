import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { AppRole } from '../../backend';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { clear, identity } = useInternetIdentity();
  const { userProfile, appRole } = useCurrentUser();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  const getRoleBadgeVariant = (role: AppRole | null | undefined) => {
    if (role === AppRole.admin) return 'default';
    if (role === AppRole.seller) return 'secondary';
    return 'outline';
  };

  const getRoleLabel = (role: AppRole | null | undefined) => {
    if (role === AppRole.admin) return 'Admin';
    if (role === AppRole.seller) return 'Seller';
    if (role === AppRole.buyer) return 'Buyer';
    return '';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center px-4 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/gst-ledger-logo.dim_512x512.png" 
            alt="GST Ledger" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-lg font-bold">GST Ledger</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Invoice & Compliance</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {identity && userProfile && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{userProfile.name}</p>
                {appRole && (
                  <Badge variant={getRoleBadgeVariant(appRole)} className="text-xs">
                    {getRoleLabel(appRole)}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {identity && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
