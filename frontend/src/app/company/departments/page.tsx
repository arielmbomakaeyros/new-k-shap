'use client';

import { useState } from 'react';
import { CompanyLayout } from '@/components/company/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';

interface Department {
  id: string;
  name: string;
  head: string;
  usersCount: number;
  createdAt: Date;
}

function DepartmentsContent() {
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: '1',
      name: 'Finance',
      head: 'Jane Smith',
      usersCount: 4,
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '2',
      name: 'Operations',
      head: 'Bob Johnson',
      usersCount: 6,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      name: 'Human Resources',
      head: 'Alice Williams',
      usersCount: 3,
      createdAt: new Date('2024-02-01'),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', head: '' });

  const handleAddDepartment = () => {
    if (formData.name && formData.head) {
      const newDept: Department = {
        id: Math.random().toString(),
        name: formData.name,
        head: formData.head,
        usersCount: 0,
        createdAt: new Date(),
      };
      setDepartments([...departments, newDept]);
      setFormData({ name: '', head: '' });
      setShowForm(false);
    }
  };

  return (
    <CompanyLayout companyName="Acme Corporation">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Departments</h1>
            <p className="mt-2 text-muted-foreground">
              Organize your company into departments
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? '- Cancel' : '+ Add Department'}
          </Button>
        </div>

        {/* Add Department Form */}
        {showForm && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Create New Department</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marketing"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Department Head
                </label>
                <select
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="">Select a user</option>
                  <option value="Jane Smith">Jane Smith</option>
                  <option value="Bob Johnson">Bob Johnson</option>
                  <option value="Alice Williams">Alice Williams</option>
                </select>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleAddDepartment}>Create Department</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Departments Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.id} className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Head: <span className="font-medium">{dept.head}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Users: <span className="font-medium">{dept.usersCount}</span>
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Created: {dept.createdAt.toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Edit
                </Button>
                <Button size="sm" variant="destructive" className="flex-1">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CompanyLayout>
  );
}

export default function DepartmentsPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <DepartmentsContent />
    </ProtectedRoute>
  );
}
