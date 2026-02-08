import { useState } from 'react';
import { User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';

export default function AuthCornerControl() {
  const { isAuthenticated, user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'login' | 'signup'>('login');

  const handleLoginClick = () => {
    setModalView('login');
    setModalOpen(true);
  };

  const handleSignUpClick = () => {
    setModalView('signup');
    setModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isAuthenticated && user) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full hover:bg-success/10 transition-colors"
              aria-label="User menu"
            >
              <Avatar className="h-10 w-10 border-2 border-success/20">
                <AvatarFallback className="bg-success/20 text-success font-semibold">
                  {getInitials(user.fullName || user.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-medium text-foreground">
              {user.fullName || user.email}
            </div>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLoginClick}
          className="h-10 w-10 rounded-full hover:bg-success/10 transition-colors"
          aria-label="Login"
        >
          <User className="h-5 w-5 text-success" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignUpClick}
          className="h-10 w-10 rounded-full hover:bg-success/10 transition-colors"
          aria-label="Sign up"
        >
          <UserPlus className="h-5 w-5 text-success" />
        </Button>
      </div>

      <AuthModal open={modalOpen} onOpenChange={setModalOpen} defaultView={modalView} />
    </>
  );
}
