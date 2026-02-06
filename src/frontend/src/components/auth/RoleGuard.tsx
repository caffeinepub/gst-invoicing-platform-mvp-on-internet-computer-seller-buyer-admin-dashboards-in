import { ReactNode } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import AccessDeniedScreen from './AccessDeniedScreen';
import { AppRole } from '../../backend';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AppRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { appRole, isAppRoleLoading } = useCurrentUser();

  if (isAppRoleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appRole || !allowedRoles.includes(appRole)) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
