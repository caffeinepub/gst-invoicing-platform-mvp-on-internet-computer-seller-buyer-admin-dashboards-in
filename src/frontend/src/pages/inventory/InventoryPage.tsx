import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetInventoryStatus, useAddInventoryItem, useUpdateInventoryItem } from '../../hooks/useInventory';
import type { InventoryItem } from '../../types/extended';

export default function InventoryPage() {
  const { data: inventory = [], isLoading } = useGetInventoryStatus();
  const addItem = useAddInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [newItem, setNewItem] = useState({
    id: '',
    name: '',
    quantity: '',
    threshold: '',
    unit: '',
  });

  const [editForm, setEditForm] = useState({
    quantity: '',
    threshold: '',
  });

  const handleAddItem = async () => {
    if (!newItem.id || !newItem.name || !newItem.quantity || !newItem.threshold || !newItem.unit) {
      toast.error('All fields are required');
      return;
    }

    try {
      await addItem.mutateAsync({
        id: newItem.id,
        name: newItem.name,
        quantity: BigInt(newItem.quantity),
        threshold: BigInt(newItem.threshold),
        unit: newItem.unit,
      });
      toast.success('Item added successfully');
      setIsAddDialogOpen(false);
      setNewItem({ id: '', name: '', quantity: '', threshold: '', unit: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item');
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem || !editForm.quantity || !editForm.threshold) {
      toast.error('Quantity and threshold are required');
      return;
    }

    try {
      await updateItem.mutateAsync({
        id: selectedItem.id,
        quantity: BigInt(editForm.quantity),
        threshold: BigInt(editForm.threshold),
      });
      toast.success('Item updated successfully');
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      setEditForm({ quantity: '', threshold: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update item');
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditForm({
      quantity: item.quantity.toString(),
      threshold: item.threshold.toString(),
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your stock</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Add a new item to your inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="itemId">Item ID</Label>
                <Input
                  id="itemId"
                  value={newItem.id}
                  onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                  placeholder="ITEM-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Product Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={newItem.threshold}
                    onChange={(e) => setNewItem({ ...newItem, threshold: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="pcs, kg, liters, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={addItem.isPending}>
                {addItem.isPending ? 'Adding...' : 'Add Item'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Items
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${inventory.length} item(s) in stock`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inventory items found. Add your first item to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => {
                    const isLowStock = item.quantity <= item.threshold;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity.toString()}</TableCell>
                        <TableCell>{item.threshold.toString()}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <span className="text-destructive font-medium">Low Stock</span>
                          ) : (
                            <span className="text-muted-foreground">In Stock</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update quantity and threshold for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editQuantity">Quantity</Label>
              <Input
                id="editQuantity"
                type="number"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editThreshold">Threshold</Label>
              <Input
                id="editThreshold"
                type="number"
                value={editForm.threshold}
                onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem} disabled={updateItem.isPending}>
              {updateItem.isPending ? 'Updating...' : 'Update Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
