import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useCurrentUser } from './hooks/useCurrentUser';
import LoginScreen from './components/auth/LoginScreen';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import AppLayout from './components/layout/AppLayout';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import BuyerDashboardPage from './pages/buyer/BuyerDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import InvoiceCreateEditPage from './pages/invoices/InvoiceCreateEditPage';
import InventoryPage from './pages/inventory/InventoryPage';
import LowStockAlertsPage from './pages/inventory/LowStockAlertsPage';
import AuditLogPage from './pages/audit/AuditLogPage';
import GstReturnsPage from './pages/gst/GstReturnsPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import AccessDeniedScreen from './components/auth/AccessDeniedScreen';
import RoleGuard from './components/auth/RoleGuard';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AppRole } from './backend';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { userProfile, isProfileLoading, isProfileFetched } = useCurrentUser();

  if (!identity) {
    return <LoginScreen />;
  }

  const showProfileSetup = !!identity && !isProfileLoading && isProfileFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  );
}

function IndexComponent() {
  const { appRole } = useCurrentUser();
  
  if (appRole === AppRole.seller) {
    return <SellerDashboardPage />;
  } else if (appRole === AppRole.buyer) {
    return <BuyerDashboardPage />;
  } else if (appRole === AppRole.admin) {
    return <AdminDashboardPage />;
  }
  
  return <AccessDeniedScreen message="Please contact an administrator to assign you a role." />;
}

function SellerDashboardComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.seller, AppRole.admin]}>
      <SellerDashboardPage />
    </RoleGuard>
  );
}

function BuyerDashboardComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.buyer, AppRole.admin]}>
      <BuyerDashboardPage />
    </RoleGuard>
  );
}

function AdminDashboardComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.admin]}>
      <AdminDashboardPage />
    </RoleGuard>
  );
}

function InvoiceCreateComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.seller, AppRole.admin]}>
      <InvoiceCreateEditPage />
    </RoleGuard>
  );
}

function InvoiceEditComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.seller, AppRole.admin]}>
      <InvoiceCreateEditPage />
    </RoleGuard>
  );
}

function InventoryComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.seller, AppRole.admin]}>
      <InventoryPage />
    </RoleGuard>
  );
}

function LowStockComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.seller, AppRole.admin]}>
      <LowStockAlertsPage />
    </RoleGuard>
  );
}

function AuditComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.admin]}>
      <AuditLogPage />
    </RoleGuard>
  );
}

function GstReturnsComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.seller, AppRole.admin]}>
      <GstReturnsPage />
    </RoleGuard>
  );
}

function RoleManagementComponent() {
  return (
    <RoleGuard allowedRoles={[AppRole.admin]}>
      <RoleManagementPage />
    </RoleGuard>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

const sellerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/seller',
  component: SellerDashboardComponent,
});

const buyerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/buyer',
  component: BuyerDashboardComponent,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardComponent,
});

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices',
  component: InvoiceListPage,
});

const invoiceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$invoiceId',
  component: InvoiceDetailPage,
});

const invoiceCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/create',
  component: InvoiceCreateComponent,
});

const invoiceEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$invoiceId/edit',
  component: InvoiceEditComponent,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: InventoryComponent,
});

const lowStockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory/low-stock',
  component: LowStockComponent,
});

const auditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audit',
  component: AuditComponent,
});

const gstReturnsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gst-returns',
  component: GstReturnsComponent,
});

const roleManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/roles',
  component: RoleManagementComponent,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  sellerDashboardRoute,
  buyerDashboardRoute,
  adminDashboardRoute,
  invoicesRoute,
  invoiceDetailRoute,
  invoiceCreateRoute,
  invoiceEditRoute,
  inventoryRoute,
  lowStockRoute,
  auditRoute,
  gstReturnsRoute,
  roleManagementRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
