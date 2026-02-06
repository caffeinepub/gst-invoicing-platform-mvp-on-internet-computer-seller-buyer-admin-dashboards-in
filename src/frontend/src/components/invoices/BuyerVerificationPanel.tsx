import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { Invoice } from '../../backend';

interface BuyerVerificationPanelProps {
  invoice: Invoice;
}

export default function BuyerVerificationPanel({ invoice }: BuyerVerificationPanelProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyInvoice(invoice.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      toast.success('Invoice verified successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify invoice');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectInvoice(invoice.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      toast.success('Invoice rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject invoice');
    },
  });

  const requestModificationMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestInvoiceModification(invoice.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      toast.success('Modification requested');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to request modification');
    },
  });

  const canVerify = invoice.status === 'sent' || invoice.status === 'draft';

  if (!canVerify) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buyer Verification</CardTitle>
        <CardDescription>Review and verify this invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" disabled={verifyMutation.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify Invoice
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Verify Invoice</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to verify this invoice? This action confirms that the invoice details are correct.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => verifyMutation.mutate()}>
                  Verify
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={rejectMutation.isPending}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Invoice
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Invoice</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reject this invoice? This action indicates that the invoice has errors or is not acceptable.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => rejectMutation.mutate()}>
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={requestModificationMutation.isPending}>
                <Edit className="mr-2 h-4 w-4" />
                Request Changes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Request Modifications</AlertDialogTitle>
                <AlertDialogDescription>
                  Request the seller to modify this invoice. The invoice will be returned to draft status.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => requestModificationMutation.mutate()}>
                  Request Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
