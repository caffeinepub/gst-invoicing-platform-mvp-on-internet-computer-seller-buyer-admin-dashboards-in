import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import HomeAuthPage from './pages/auth/HomeAuthPage';
import OverviewPage from './pages/energy/OverviewPage';
import InputsPage from './pages/energy/InputsPage';
import ConsumptionPage from './pages/energy/ConsumptionPage';
import SolarAnalysisPage from './pages/energy/SolarAnalysisPage';
import CostEstimationPage from './pages/energy/CostEstimationPage';
import { EnergyFlowProvider } from './state/EnergyFlowContext';
import { AuthProvider } from './context/AuthContext';
import { LiveTelemetryProvider } from './context/LiveTelemetryContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AuthenticatedLayout() {
  return (
    <LiveTelemetryProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </LiveTelemetryProvider>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeAuthPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: () => (
    <ProtectedRoute>
      <AuthenticatedLayout />
    </ProtectedRoute>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: OverviewPage,
});

const inputsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/inputs',
  component: InputsPage,
});

const consumptionRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/consumption',
  component: ConsumptionPage,
});

const solarAnalysisRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/solar-analysis',
  component: SolarAnalysisPage,
});

const costEstimationRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/cost-estimation',
  component: CostEstimationPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    inputsRoute,
    consumptionRoute,
    solarAnalysisRoute,
    costEstimationRoute,
  ]),
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
      <AuthProvider>
        <EnergyFlowProvider>
          <RouterProvider router={router} />
          <Toaster />
        </EnergyFlowProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
