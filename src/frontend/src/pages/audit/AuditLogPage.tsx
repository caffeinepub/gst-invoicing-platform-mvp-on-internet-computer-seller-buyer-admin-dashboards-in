import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { useGetAuditLogs } from '../../hooks/useAuditLogs';
import type { AuditFilters } from '../../types/extended';

export default function AuditLogPage() {
  const [actionType, setActionType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filters: AuditFilters | null = actionType === 'all' && !startDate && !endDate
    ? null
    : {
        actionType: actionType === 'all' ? undefined : actionType,
        startDate: startDate ? BigInt(new Date(startDate).getTime() * 1000000) : undefined,
        endDate: endDate ? BigInt(new Date(endDate).getTime() * 1000000) : undefined,
        limit: BigInt(100),
        offset: BigInt(0),
      };

  const { data: logs = [], isLoading } = useGetAuditLogs(filters);

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'invoice_create', label: 'Invoice Created' },
    { value: 'invoice_update', label: 'Invoice Updated' },
    { value: 'invoice_verify', label: 'Invoice Verified' },
    { value: 'invoice_reject', label: 'Invoice Rejected' },
    { value: 'invoice_modify_request', label: 'Modification Requested' },
    { value: 'role_assign', label: 'Role Assigned' },
    { value: 'payment_initiate', label: 'Payment Initiated' },
    { value: 'payment_update', label: 'Payment Updated' },
    { value: 'inventory_add', label: 'Inventory Added' },
    { value: 'inventory_update', label: 'Inventory Updated' },
  ];

  const getActionBadge = (action: string) => {
    if (action.includes('verify') || action.includes('create') || action.includes('add')) {
      return <Badge variant="default">{action}</Badge>;
    }
    if (action.includes('reject') || action.includes('delete')) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes('update') || action.includes('modify')) {
      return <Badge variant="secondary">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track all system activities and changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
          <CardDescription>Filter audit logs by action type and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger id="actionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${logs.length} audit event(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Actor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(Number(log.timestamp) / 1000000).toLocaleString()}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="max-w-md truncate">{log.details}</TableCell>
                      <TableCell>
                        {log.invoiceId ? (
                          <span className="font-mono text-sm">{log.invoiceId}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.actor.toString().slice(0, 12)}...
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
