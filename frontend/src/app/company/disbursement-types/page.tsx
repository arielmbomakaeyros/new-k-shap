'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/src/components/ui/modal';
import {
  useDisbursementTypes,
  useCreateDisbursementType,
  useUpdateDisbursementType,
  useDeleteDisbursementType,
} from '@/src/hooks/queries';
import type { DisbursementType } from '@/src/services';

type ErrorModalState = {
  title: string;
  message: string;
  details: string[];
} | null;

function DisbursementTypesContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedType, setSelectedType] = useState<DisbursementType | null>(null);
  const [errorModal, setErrorModal] = useState<ErrorModalState>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const { data: typesData, isLoading, error } = useDisbursementTypes();

  const createMutation = useCreateDisbursementType();
  const updateMutation = useUpdateDisbursementType();
  const deleteMutation = useDeleteDisbursementType();

  const getErrorDetails = (err: unknown, fallback: string) => {
    if (err && typeof err === 'object') {
      const maybeError = err as { message?: string; errors?: Record<string, string[]> };
      const details = maybeError.errors
        ? Object.entries(maybeError.errors).map(
            ([field, messages]) => `${field}: ${messages.join(' ')}`
          )
        : [];
      return {
        message: maybeError.message || fallback,
        details,
      };
    }
    return { message: fallback, details: [] };
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', isActive: true });
  };

  const handleCreateType = async () => {
    if (!formData.name) return;
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        isActive: formData.isActive,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create disbursement type:', err);
      const { message, details } = getErrorDetails(err, 'Failed to create disbursement type.');
      setErrorModal({ title: 'Error', message, details });
    }
  };

  const handleOpenEdit = (type: DisbursementType) => {
    setSelectedType(type);
    setEditFormData({
      name: type.name || '',
      description: type.description || '',
      isActive: type.isActive ?? true,
    });
    setShowEditModal(true);
  };

  const handleUpdateType = async () => {
    if (!selectedType) return;
    const id = (selectedType as any).id || (selectedType as any)._id;
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: editFormData.name,
          description: editFormData.description || undefined,
          isActive: editFormData.isActive,
        },
      });
      setShowEditModal(false);
      setSelectedType(null);
    } catch (err) {
      console.error('Failed to update disbursement type:', err);
      const { message, details } = getErrorDetails(err, 'Failed to update disbursement type.');
      setErrorModal({ title: 'Error', message, details });
    }
  };

  const handleDeleteType = async (type: DisbursementType) => {
    const id = (type as any).id || (type as any)._id;
    if (!id) return;
    if (!confirm('Are you sure you want to delete this disbursement type?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete disbursement type:', err);
      const { message, details } = getErrorDetails(err, 'Failed to delete disbursement type.');
      setErrorModal({ title: 'Error', message, details });
    }
  };

  if (isLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading disbursement types...</span>
        </div>
      </CompanyLayout>
    );
  }

  if (error) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load disbursement types. Please try again.</p>
        </div>
      </CompanyLayout>
    );
  }

  const types = typesData?.data ?? [];

  return (
    <CompanyLayout companyName="Company">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Disbursement Types</h1>
            <p className="mt-2 text-muted-foreground">Define and organize disbursement categories</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="btn-3d gradient-bg-primary text-white">
            + Add Type
          </Button>
        </div>

        {types.length === 0 && (
          <div className="glass-card rounded-xl py-12 text-center">
            <p className="text-muted-foreground">No disbursement types found. Create your first type.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {types.map((type: any) => {
            const id = type.id || type._id;
            return (
              <div key={id} className="glass-card rounded-xl p-6 group">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold gradient-text group-hover:opacity-80 transition-opacity">
                    {type.name}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      type.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {type.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {type.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{type.description}</p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Created: {type.createdAt ? new Date(type.createdAt).toLocaleDateString() : '-'}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => handleOpenEdit(type)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteType(type)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
          <ModalHeader>
            <ModalTitle>Create Disbursement Type</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Type name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={3}
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
            <Button onClick={handleCreateType} disabled={createMutation.isPending || !formData.name}>
              {createMutation.isPending ? 'Creating...' : 'Create Type'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
          <ModalHeader>
            <ModalTitle>Edit Disbursement Type</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Type name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Description"
                rows={3}
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
            <Button onClick={handleUpdateType} disabled={updateMutation.isPending || !editFormData.name}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        {errorModal && (
          <Modal isOpen={!!errorModal} onClose={() => setErrorModal(null)} size="md">
            <ModalHeader>
              <ModalTitle>{errorModal.title}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-foreground">{errorModal.message}</p>
              {errorModal.details.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {errorModal.details.map((detail, index) => (
                    <li key={`${detail}-${index}`}>{detail}</li>
                  ))}
                </ul>
              )}
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

export default function DisbursementTypesPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <DisbursementTypesContent />
    </ProtectedRoute>
  );
}
