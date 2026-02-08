import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import { useAuth } from '../../hooks/useAuth';
import { loginUser, registerUser } from '../../services/authApi';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'login' | 'signup';
}

export default function AuthModal({ open, onOpenChange, defaultView = 'login' }: AuthModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultView);
  const [successMessage, setSuccessMessage] = useState('');

  // Reset state when modal opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSuccessMessage('');
      setActiveTab(defaultView);
    }
    onOpenChange(newOpen);
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await loginUser({ email, password });
    login(response.token, response.user);
    onOpenChange(false);
    navigate({ to: '/dashboard' });
  };

  const handleSignUp = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    const response = await registerUser({ fullName, email, password, confirmPassword });

    if (response.token) {
      // Auto-login if token is returned
      login(response.token, response.user);
      onOpenChange(false);
      navigate({ to: '/dashboard' });
    } else {
      // Show success message and switch to login
      setSuccessMessage('Account created successfully! Please log in.');
      setActiveTab('login');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>Login or create an account to get started</DialogDescription>
        </DialogHeader>

        {successMessage && (
          <Alert className="bg-success/10 border-success text-success-foreground">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm onSubmit={handleLogin} />
          </TabsContent>

          <TabsContent value="signup">
            <SignUpForm onSubmit={handleSignUp} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
