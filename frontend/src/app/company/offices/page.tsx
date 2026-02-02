'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import {
  useOffices,
  useCreateOffice,
  useDeleteOffice,
} from '@/src/hooks/queries';

function OfficesContent() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
  });

  // Fetch offices from API
  const { data: officesData, isLoading, error } = useOffices();

  // Mutations
  const createMutation = useCreateOffice();
  const deleteMutation = useDeleteOffice();

  const handleAddOffice = async () => {
    if (formData.name && formData.location) {
      try {
        await createMutation.mutateAsync({
          name: formData.name,
          location: formData.location,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
        });
        setFormData({ name: '', location: '', address: '', phone: '' });
        setShowForm(false);
      } catch (error) {
        console.error('Failed to create office:', error);
      }
    }
  };

  const handleDeleteOffice = async (id: string) => {
    if (confirm('Are you sure you want to delete this office?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete office:', error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading offices...</span>
        </div>
      </CompanyLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load offices. Please try again.</p>
        </div>
      </CompanyLayout>
    );
  }

  const offices = officesData?.data ?? [];

  return (
    <CompanyLayout companyName="Company">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Offices</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your company's office locations
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-3d gradient-bg-primary text-white">
            {showForm ? '- Cancel' : '+ Add Office'}
          </Button>
        </div>

        {/* Add Office Form */}
        {showForm && (
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold gradient-text">Create New Office</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Office Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., New York HQ"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., New York, USA"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Full Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Complete street address"
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleAddOffice}
                  disabled={createMutation.isPending || !formData.name || !formData.location}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Office'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {offices.length === 0 && (
          <div className="glass-card rounded-xl py-12 text-center">
            <p className="text-muted-foreground">No offices found. Create your first office.</p>
          </div>
        )}

        {/* Offices Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {offices.map((office) => (
            <div key={office.id} className="glass-card rounded-xl p-6 group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold gradient-text group-hover:opacity-80 transition-opacity">{office.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{office.location}</p>
                </div>
                <span className="text-2xl">🏢</span>
              </div>

              {office.address && (
                <p className="mt-3 text-sm text-muted-foreground">{office.address}</p>
              )}

              {office.phone && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Phone: {office.phone}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(office.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteOffice(office.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CompanyLayout>
  );
}

export default function OfficesPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <OfficesContent />
    </ProtectedRoute>
  );
}
