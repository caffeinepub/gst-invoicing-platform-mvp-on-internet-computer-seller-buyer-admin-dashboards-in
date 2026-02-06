import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function BuyerDashboardPage() {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Pending Review', value: '0', icon: Clock, color: 'text-amber-600' },
    { label: 'Verified', value: '0', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Rejected', value: '0', icon: XCircle, color: 'text-red-600' },
    { label: 'Total Invoices', value: '0', icon: FileText, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
        <p className="text-muted-foreground mt-1">Review and verify invoices</p>
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
          <CardDescription>Review pending invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate({ to: '/invoices' })}>
            <FileText className="mr-2 h-4 w-4" />
            View All Invoices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
