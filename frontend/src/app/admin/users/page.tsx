'use client';

import { useState } from 'react';
import { useTranslation } from '@/node_modules/react-i18next';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/src/components/admin/AdminLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: string;
  joinDate: Date;
}

function UsersManagerContent() {
  const { t } = useTranslation();

  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@acme.com',
      company: 'Acme Corp',
      role: 'company_super_admin',
      status: 'active',
      joinDate: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@acme.com',
      company: 'Acme Corp',
      role: 'validator',
      status: 'active',
      joinDate: new Date('2024-01-20'),
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@techinnovations.com',
      company: 'Tech Innovations',
      role: 'agent',
      status: 'active',
      joinDate: new Date('2024-01-10'),
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@globalsolutions.com',
      company: 'Global Solutions',
      role: 'cashier',
      status: 'inactive',
      joinDate: new Date('2023-12-20'),
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

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600' : 'text-gray-600';
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="mt-2 text-muted-foreground">Manage all platform users across companies</p>
          </div>
          <Button>+ Add User</Button>
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

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
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
                  <td className="px-4 py-3 text-sm">{user.company}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {user.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold ${getStatusColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </td>
                  <td className="px-4 py-3 text-sm">{user.joinDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Deactivate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'kaeyros_support']}>
      <UsersManagerContent />
    </ProtectedRoute>
  );
}
