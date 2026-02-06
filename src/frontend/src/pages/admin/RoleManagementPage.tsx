import { useState } from 'react';
import { useAssignRole } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { AppRole, type UserProfile } from '../../backend';

export default function RoleManagementPage() {
  const [principalId, setPrincipalId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AppRole>(AppRole.seller);
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [state, setState] = useState('');

  const assignRole = useAssignRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalId.trim() || !name.trim()) {
      toast.error('Principal ID and Name are required');
      return;
    }

    try {
      const principal = Principal.fromText(principalId.trim());
      
      const profile: UserProfile = {
        name: name.trim(),
        appRole: role,
        companyName: companyName.trim() || undefined,
        gstNumber: gstNumber.trim() || undefined,
        state: state.trim() || undefined,
      };

      await assignRole.mutateAsync({ user: principal, profile, role });
      
      toast.success(`Role ${role} assigned successfully to ${name}`);
      
      // Reset form
      setPrincipalId('');
      setName('');
      setRole(AppRole.seller);
      setCompanyName('');
      setGstNumber('');
      setState('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign role');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground mt-1">Assign roles to users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign User Role</CardTitle>
          <CardDescription>
            Provide a user's Principal ID and assign them a role (Seller, Buyer, or Admin)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principalId">Principal ID *</Label>
              <Input
                id="principalId"
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="User's full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AppRole.seller}>Seller</SelectItem>
                  <SelectItem value={AppRole.buyer}>Buyer</SelectItem>
                  <SelectItem value={AppRole.admin}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <Button type="submit" disabled={assignRole.isPending}>
              {assignRole.isPending ? 'Assigning Role...' : 'Assign Role'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
