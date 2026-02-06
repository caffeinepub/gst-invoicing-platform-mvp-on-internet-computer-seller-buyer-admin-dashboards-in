import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import BuyerVerificationPanel from '../../components/invoices/BuyerVerificationPanel';
import InvoicePaymentPanel from '../../components/invoices/InvoicePaymentPanel';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { POLLING_CONFIG } from '../../config/polling';
import type { Invoice } from '../../backend';

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams({ strict: false });
  const { actor, isFetching: actorFetching } = useActor();
  const { appRole, isAuthenticated } = useCurrentUser();
  const navigate = useNavigate();

  const { data: invoice, isLoading } = useQuery<Invoice | null>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!actor || !invoiceId) return null;
      return actor.getInvoice(invoiceId);
    },
    enabled: !!actor && !actorFetching && !!invoiceId && isAuthenticated,
    refetchInterval: POLLING_CONFIG.invoices,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/invoices' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Invoice not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      sent: 'secondary',
      verified: 'default',
      rejected: 'destructive',
      paid: 'default',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const gstRate = invoice.gstRate.__kind__ === 'cgstSgst' 
    ? `CGST/SGST ${invoice.gstRate.cgstSgst}%`
    : `IGST ${invoice.gstRate.igst}%`;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/invoices' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice {invoice.id}</h1>
          <p className="text-muted-foreground mt-1">Invoice details and verification</p>
        </div>
        {getStatusBadge(invoice.status)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Invoice ID</p>
              <p className="font-medium">{invoice.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Place of Supply</p>
              <p className="font-medium">{invoice.placeOfSupply}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GST Rate</p>
              <p className="font-medium">{gstRate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{invoice.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>{invoice.items.length} item(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoice.items.map(([name, qty], idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">Qty: {qty.toString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {appRole === 'buyer' && invoice.buyer && (
        <BuyerVerificationPanel invoice={invoice} />
      )}

      <InvoicePaymentPanel invoice={invoice} />
    </div>
  );
}
