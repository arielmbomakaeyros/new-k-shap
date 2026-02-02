'use client';

import { useState } from 'react';
import { CompanyLayout } from '@/components/company/CompanyLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  joinDate: Date;
}

function CompanyUsersContent() {
  const [users, setUsers] = useState<CompanyUser[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@acme.com',
      role: 'company_super_admin',
      department: 'Management',
      status: 'active',
      joinDate: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@acme.com',
      role: 'validator',
      department: 'Finance',
      status: 'active',
      joinDate: new Date('2024-01-20'),
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@acme.com',
      role: 'department_head',
      department: 'Operations',
      status: 'active',
      joinDate: new Date('2024-02-01'),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <CompanyLayout companyName="Acme Corporation">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your company users and assign roles
            </p>
          </div>
          <Button>+ Invite User</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">All Roles</option>
            <option value="company_super_admin">Company Admin</option>
            <option value="validator">Validator</option>
            <option value="department_head">Department Head</option>
            <option value="agent">Agent</option>
            <option value="cashier">Cashier</option>
            <option value="accountant">Accountant</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={user.role}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      <option value="company_super_admin">Company Admin</option>
                      <option value="validator">Validator</option>
                      <option value="department_head">Department Head</option>
                      <option value="agent">Agent</option>
                      <option value="cashier">Cashier</option>
                      <option value="accountant">Accountant</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.department}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.joinDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CompanyLayout>
  );
}

export default function CompanyUsersPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <CompanyUsersContent />
    </ProtectedRoute>
  );
}
