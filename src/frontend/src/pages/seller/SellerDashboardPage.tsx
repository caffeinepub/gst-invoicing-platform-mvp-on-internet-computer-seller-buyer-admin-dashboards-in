import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { FileText, Package, DollarSign, TrendingUp } from 'lucide-react';

export default function SellerDashboardPage() {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Total Invoices', value: '0', icon: FileText, color: 'text-blue-600' },
    { label: 'Pending Payments', value: '₹0', icon: DollarSign, color: 'text-amber-600' },
    { label: 'Low Stock Items', value: '0', icon: Package, color: 'text-red-600' },
    { label: 'This Month', value: '₹0', icon: TrendingUp, color: 'text-green-600' },
  ];

  const quickActions = [
    { label: 'Create Invoice', path: '/invoices/create', icon: FileText },
    { label: 'View Invoices', path: '/invoices', icon: FileText },
    { label: 'Manage Inventory', path: '/inventory', icon: Package },
    { label: 'GST Returns', path: '/gst-returns', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your invoices, inventory, and compliance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.path}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate({ to: action.path })}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
