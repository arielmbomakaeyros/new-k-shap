'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ConfirmModal } from '@/src/components/ui/modal';
import { usePaymentMethods, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod } from '@/src/hooks/queries';
import { api } from '@/src/lib/axios';
import type { PaymentMethod } from '@/src/services';

type ErrorModalState = {
  title: string;
  message: string;
  details: string[];
} | null;

function PaymentMethodsContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<PaymentMethod | null>(null);
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [errorModal, setErrorModal] = useState<ErrorModalState>(null);
  const [formData, setFormData] = useState({ name: '', code: '', isActive: true });
  const [editFormData, setEditFormData] = useState({ name: '', code: '', isActive: true });

  const { data: methodsData, isLoading, error } = usePaymentMethods();
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();

  const resetForm = () => {
    setFormData({ name: '', code: '', isActive: true });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.code) return;
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        code: formData.code,
        isActive: formData.isActive,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setErrorModal({ title: 'Error', message: 'Failed to create payment method.', details: [] });
    }
  };

  const handleOpenEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setEditFormData({
      name: method.name || '',
      code: method.code || '',
      isActive: method.isActive ?? true,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedMethod) return;
    const id = (selectedMethod as any).id || (selectedMethod as any)._id;
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: editFormData.name,
          code: editFormData.code,
          isActive: editFormData.isActive,
        },
      });
      setShowEditModal(false);
      setSelectedMethod(null);
    } catch (err) {
      setErrorModal({ title: 'Error', message: 'Failed to update payment method.', details: [] });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const id = (confirmDelete as any).id || (confirmDelete as any)._id;
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      setConfirmDelete(null);
    } catch (err) {
      setErrorModal({ title: 'Error', message: 'Failed to delete payment method.', details: [] });
    }
  };

  const handleSeedDefaults = async () => {
    try {
      await api.post('/payment-methods/seed-default');
    } catch (err) {
      setErrorModal({ title: 'Error', message: 'Failed to seed payment methods.', details: [] });
    } finally {
      setConfirmSeed(false);
    }
  };

  const methods = methodsData?.data ?? [];

  if (isLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading payment methods...</span>
        </div>
      </CompanyLayout>
    );
  }

  if (error) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load payment methods. Please try again.</p>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout companyName="Company">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Payment Methods</h1>
            <p className="mt-2 text-muted-foreground">Manage payment options for disbursements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmSeed(true)}>
              Generate Defaults
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="btn-3d gradient-bg-primary text-white">
              + Add Payment Method
            </Button>
          </div>
        </div>

        {methods.length === 0 && (
          <div className="glass-card rounded-xl py-12 text-center">
            <p className="text-muted-foreground">No payment methods found. Create your first method.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {methods.map((method: any) => {
            const id = method.id || method._id;
            return (
              <div key={id} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold gradient-text">{method.name}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      method.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {method.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Code: {method.code}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => handleOpenEdit(method)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setConfirmDelete(method)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
          <ModalHeader>
            <ModalTitle>Create Payment Method</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Payment method name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="payment_method_code"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
          </ModalBody>
          <ModalFooter className="flex gap-4">
            <Button onClick={handleCreate} disabled={createMutation.isPending || !formData.name || !formData.code}>
              {createMutation.isPending ? 'Creating...' : 'Create Payment Method'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
          <ModalHeader>
            <ModalTitle>Edit Payment Method</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Payment method name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <input
                type="text"
                value={editFormData.code}
                onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                placeholder="payment_method_code"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
          </ModalBody>
          <ModalFooter className="flex gap-4">
            <Button onClick={handleUpdate} disabled={updateMutation.isPending || !editFormData.name || !editFormData.code}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Payment Method"
          message={`Delete ${confirmDelete?.name}?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        <ConfirmModal
          isOpen={confirmSeed}
          onClose={() => setConfirmSeed(false)}
          onConfirm={handleSeedDefaults}
          title="Generate Default Payment Methods"
          message="Generate default payment methods for this company?"
          confirmLabel="Generate"
          cancelLabel="Cancel"
          variant="success"
        />

        {errorModal && (
          <Modal isOpen={!!errorModal} onClose={() => setErrorModal(null)} size="md">
            <ModalHeader>
              <ModalTitle>{errorModal.title}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-foreground">{errorModal.message}</p>
            </ModalBody>
            <ModalFooter className="flex justify-end">
              <Button onClick={() => setErrorModal(null)}>Close</Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </CompanyLayout>
  );
}

export default function PaymentMethodsPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <PaymentMethodsContent />
    </ProtectedRoute>
  );
}
