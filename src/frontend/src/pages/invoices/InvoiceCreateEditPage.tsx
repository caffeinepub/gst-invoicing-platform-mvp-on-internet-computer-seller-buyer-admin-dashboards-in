import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { Variant_verified_cancelled_paid_sent_rejected_draft, type GSTType } from '../../backend';

export default function InvoiceCreateEditPage() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [invoiceId, setInvoiceId] = useState('');
  const [buyerPrincipal, setBuyerPrincipal] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [gstType, setGstType] = useState<'cgstSgst' | 'igst'>('cgstSgst');
  const [gstRate, setGstRate] = useState('18');
  const [items, setItems] = useState<Array<{ name: string; quantity: string }>>([
    { name: '', quantity: '' },
  ]);

  const createInvoice = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');

      const buyer = buyerPrincipal.trim() ? Principal.fromText(buyerPrincipal.trim()) : null;
      
      const invoiceItems: Array<[string, bigint]> = items
        .filter(item => item.name.trim() && item.quantity.trim())
        .map(item => [item.name.trim(), BigInt(item.quantity)]);

      const gst: GSTType = gstType === 'cgstSgst'
        ? { __kind__: 'cgstSgst', cgstSgst: parseFloat(gstRate) }
        : { __kind__: 'igst', igst: parseFloat(gstRate) };

      await actor.createInvoiceCaller(
        invoiceId.trim(),
        buyer,
        invoiceItems,
        gst,
        Variant_verified_cancelled_paid_sent_rejected_draft.draft,
        placeOfSupply.trim()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      toast.success('Invoice created successfully!');
      navigate({ to: '/invoices' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create invoice');
    },
  });

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'name' | 'quantity', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId.trim() || !placeOfSupply.trim()) {
      toast.error('Invoice ID and Place of Supply are required');
      return;
    }

    const validItems = items.filter(item => item.name.trim() && item.quantity.trim());
    if (validItems.length === 0) {
      toast.error('At least one item is required');
      return;
    }

    createInvoice.mutate();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/invoices' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-muted-foreground mt-1">Fill in the invoice details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Enter the basic invoice information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoiceId">Invoice ID *</Label>
                <Input
                  id="invoiceId"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  placeholder="INV-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeOfSupply">Place of Supply *</Label>
                <Input
                  id="placeOfSupply"
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  placeholder="e.g., Maharashtra"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerPrincipal">Buyer Principal (Optional)</Label>
                <Input
                  id="buyerPrincipal"
                  value={buyerPrincipal}
                  onChange={(e) => setBuyerPrincipal(e.target.value)}
                  placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstType">GST Type *</Label>
                <Select value={gstType} onValueChange={(value) => setGstType(value as 'cgstSgst' | 'igst')}>
                  <SelectTrigger id="gstType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cgstSgst">CGST/SGST (Intra-state)</SelectItem>
                    <SelectItem value="igst">IGST (Inter-state)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate (%) *</Label>
                <Input
                  id="gstRate"
                  type="number"
                  step="0.01"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  placeholder="18"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Line Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-32"
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/invoices' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
