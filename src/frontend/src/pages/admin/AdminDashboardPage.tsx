import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Users, FileText, ClipboardList, Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const quickActions = [
    { label: 'Role Management', path: '/admin/roles', icon: Users },
    { label: 'All Invoices', path: '/invoices', icon: FileText },
    { label: 'Audit Logs', path: '/audit', icon: ClipboardList },
    { label: 'GST Returns', path: '/gst-returns', icon: Shield },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System administration and oversight</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrative Actions</CardTitle>
          <CardDescription>Manage users, roles, and system compliance</CardDescription>
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
