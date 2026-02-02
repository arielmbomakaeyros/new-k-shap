'use client';

import { useState } from 'react';
import { CompanyLayout } from '@/components/company/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';

interface Office {
  id: string;
  name: string;
  location: string;
  address: string;
  usersCount: number;
  createdAt: Date;
}

function OfficesContent() {
  const [offices, setOffices] = useState<Office[]>([
    {
      id: '1',
      name: 'Headquarters',
      location: 'New York, USA',
      address: '123 Business Ave, New York, NY 10001',
      usersCount: 8,
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      name: 'Regional Office',
      location: 'Los Angeles, USA',
      address: '456 Commerce St, Los Angeles, CA 90001',
      usersCount: 5,
      createdAt: new Date('2024-02-01'),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
  });

  const handleAddOffice = () => {
    if (formData.name && formData.location && formData.address) {
      const newOffice: Office = {
        id: Math.random().toString(),
        name: formData.name,
        location: formData.location,
        address: formData.address,
        usersCount: 0,
        createdAt: new Date(),
      };
      setOffices([...offices, newOffice]);
      setFormData({ name: '', location: '', address: '' });
      setShowForm(false);
    }
  };

  return (
    <CompanyLayout companyName="Acme Corporation">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Offices</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your company's office locations
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? '- Cancel' : '+ Add Office'}
          </Button>
        </div>

        {/* Add Office Form */}
        {showForm && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Create New Office</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Office Name
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
                <label className="block text-sm font-medium text-foreground">Location</label>
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
              <div className="flex gap-4">
                <Button onClick={handleAddOffice}>Create Office</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Offices Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {offices.map((office) => (
            <div key={office.id} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{office.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{office.location}</p>
                </div>
                <span className="text-2xl">🏢</span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{office.address}</p>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Users in this office</p>
                  <p className="text-lg font-bold text-foreground">{office.usersCount}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive">
                    Delete
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Created: {office.createdAt.toLocaleDateString()}
              </p>
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
