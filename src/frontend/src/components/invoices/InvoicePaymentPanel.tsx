import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetPaymentStatus, useInitiatePayment, useUpdatePaymentStatus } from '../../hooks/usePayments';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { PaymentStatus } from '../../types/extended';
import type { Invoice } from '../../backend';

interface InvoicePaymentPanelProps {
  invoice: Invoice;
}

export default function InvoicePaymentPanel({ invoice }: InvoicePaymentPanelProps) {
  const { appRole } = useCurrentUser();
  const { data: payment, isLoading: paymentLoading } = useGetPaymentStatus(invoice.id);
  const initiatePayment = useInitiatePayment();
  const updatePayment = useUpdatePaymentStatus();

  const [amount, setAmount] = useState('');
  const [newStatus, setNewStatus] = useState<PaymentStatus>(PaymentStatus.pending);

  const handleInitiatePayment = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await initiatePayment.mutateAsync({ invoiceId: invoice.id, amount: parsedAmount });
      toast.success('Payment initiated successfully');
      setAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    }
  };

  const handleUpdatePayment = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await updatePayment.mutateAsync({ 
        invoiceId: invoice.id, 
        status: newStatus, 
        amount: parsedAmount 
      });
      toast.success('Payment status updated');
      setAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment');
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      partial: 'secondary',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const canInitiatePayment = appRole === 'buyer' || appRole === 'admin';
  const canUpdatePayment = appRole === 'seller' || appRole === 'admin';

  if (paymentLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Tracking
        </CardTitle>
        <CardDescription>Track payment status for this invoice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {payment ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              {getPaymentStatusBadge(payment.status)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm">{new Date(Number(payment.timestamp) / 1000000).toLocaleDateString()}</span>
            </div>

            {canUpdatePayment && payment.status !== PaymentStatus.completed && (
              <div className="pt-4 border-t space-y-3">
                <Label htmlFor="updateAmount">Update Payment</Label>
                <Input
                  id="updateAmount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as PaymentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentStatus.pending}>Pending</SelectItem>
                    <SelectItem value={PaymentStatus.partial}>Partial</SelectItem>
                    <SelectItem value={PaymentStatus.completed}>Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleUpdatePayment} 
                  disabled={updatePayment.isPending}
                  className="w-full"
                >
                  {updatePayment.isPending ? 'Updating...' : 'Update Payment Status'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">No payment recorded for this invoice</p>
            
            {canInitiatePayment && (
              <div className="space-y-3">
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button 
                  onClick={handleInitiatePayment} 
                  disabled={initiatePayment.isPending}
                  className="w-full"
                >
                  {initiatePayment.isPending ? 'Initiating...' : 'Initiate Payment'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
