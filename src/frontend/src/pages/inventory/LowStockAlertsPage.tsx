import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { useGetLowStockAlerts } from '../../hooks/useInventory';

export default function LowStockAlertsPage() {
  const { data: alerts = [], isLoading } = useGetLowStockAlerts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Low Stock Alerts</h1>
        <p className="text-muted-foreground mt-1">Monitor items below threshold</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Low Stock Items
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${alerts.length} item(s) below threshold`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No low stock alerts at this time. All items are above their thresholds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Current Quantity</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.item.id}>
                      <TableCell className="font-medium">{alert.item.id}</TableCell>
                      <TableCell>{alert.item.name}</TableCell>
                      <TableCell className="text-destructive font-medium">
                        {alert.currentQuantity.toString()}
                      </TableCell>
                      <TableCell>{alert.threshold.toString()}</TableCell>
                      <TableCell>{alert.item.unit}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Low Stock</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
