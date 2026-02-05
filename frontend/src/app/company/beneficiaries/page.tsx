'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CompanyLayout } from '@/src/components/company/CompanyLayout';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/src/components/ui/modal';
import {
  useBeneficiaries,
  useCreateBeneficiary,
  useUpdateBeneficiary,
  useDeleteBeneficiary,
  useDisbursementTypes,
} from '@/src/hooks/queries';
import type { Beneficiary } from '@/src/services';

type ErrorModalState = {
  title: string;
  message: string;
  details: string[];
} | null;

function BeneficiariesContent() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [errorModal, setErrorModal] = useState<ErrorModalState>(null);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    type: 'supplier',
    disbursementType: '',
    email: '',
    phone: '',
    address: '',
    accountNumber: '',
    bankName: '',
    isActive: true,
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: 'supplier',
    disbursementType: '',
    email: '',
    phone: '',
    address: '',
    accountNumber: '',
    bankName: '',
    isActive: true,
  });

  const { data: beneficiariesData, isLoading, error } = useBeneficiaries();
  const { data: disbursementTypesData } = useDisbursementTypes();

  const createMutation = useCreateBeneficiary();
  const updateMutation = useUpdateBeneficiary();
  const deleteMutation = useDeleteBeneficiary();

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
    setFormData({
      name: '',
      type: 'supplier',
      disbursementType: '',
      email: '',
      phone: '',
      address: '',
      accountNumber: '',
      bankName: '',
      isActive: true,
    });
  };

  const handleCreateBeneficiary = async () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name) {
      nextErrors.name = 'Name is required.';
    }
    if (!formData.disbursementType) {
      nextErrors.disbursementType = 'Disbursement type is required.';
    }
    setCreateErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        type: formData.type || undefined,
        disbursementType: formData.disbursementType,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        accountNumber: formData.accountNumber || undefined,
        bankName: formData.bankName || undefined,
        isActive: formData.isActive,
      });
      setShowCreateModal(false);
      resetForm();
      setCreateErrors({});
    } catch (err) {
      console.error('Failed to create beneficiary:', err);
      const { message, details } = getErrorDetails(err, 'Failed to create beneficiary.');
      setErrorModal({ title: 'Error', message, details });
    }
  };

  const handleOpenEdit = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setEditFormData({
      name: beneficiary.name || '',
      type: beneficiary.type || 'supplier',
      disbursementType:
        (typeof beneficiary.disbursementType === 'string'
          ? beneficiary.disbursementType
          : beneficiary.disbursementType?._id || beneficiary.disbursementType?.id) || '',
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      address: beneficiary.address || '',
      accountNumber: beneficiary.accountNumber || '',
      bankName: beneficiary.bankName || '',
      isActive: beneficiary.isActive ?? true,
    });
    setShowEditModal(true);
  };

  const handleUpdateBeneficiary = async () => {
    if (!selectedBeneficiary) return;
    const id = (selectedBeneficiary as any).id || (selectedBeneficiary as any)._id;
    if (!id) return;
    const nextErrors: Record<string, string> = {};
    if (!editFormData.name) {
      nextErrors.name = 'Name is required.';
    }
    if (!editFormData.disbursementType) {
      nextErrors.disbursementType = 'Disbursement type is required.';
    }
    setEditErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: editFormData.name,
          type: editFormData.type || undefined,
          disbursementType: editFormData.disbursementType || undefined,
          email: editFormData.email || undefined,
          phone: editFormData.phone || undefined,
          address: editFormData.address || undefined,
          accountNumber: editFormData.accountNumber || undefined,
          bankName: editFormData.bankName || undefined,
          isActive: editFormData.isActive,
        },
      });
      setShowEditModal(false);
      setSelectedBeneficiary(null);
      setEditErrors({});
    } catch (err) {
      console.error('Failed to update beneficiary:', err);
      const { message, details } = getErrorDetails(err, 'Failed to update beneficiary.');
      setErrorModal({ title: 'Error', message, details });
    }
  };

  const handleDeleteBeneficiary = async (beneficiary: Beneficiary) => {
    const id = (beneficiary as any).id || (beneficiary as any)._id;
    if (!id) return;
    if (!confirm('Are you sure you want to delete this beneficiary?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete beneficiary:', err);
      const { message, details } = getErrorDetails(err, 'Failed to delete beneficiary.');
      setErrorModal({ title: 'Error', message, details });
    }
  };

  if (isLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading beneficiaries...</span>
        </div>
      </CompanyLayout>
    );
  }

  if (error) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Failed to load beneficiaries. Please try again.</p>
        </div>
      </CompanyLayout>
    );
  }

  const beneficiaries = beneficiariesData?.data ?? [];
  const disbursementTypes = disbursementTypesData?.data ?? [];
  const disbursementTypeById = new Map(
    disbursementTypes.map((type: any) => [type.id || type._id, type])
  );

  return (
    <CompanyLayout companyName="Company">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Beneficiaries</h1>
            <p className="mt-2 text-muted-foreground">Manage payees for disbursements</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="btn-3d gradient-bg-primary text-white">
            + Add Beneficiary
          </Button>
        </div>

        {beneficiaries.length === 0 && (
          <div className="glass-card rounded-xl py-12 text-center">
            <p className="text-muted-foreground">No beneficiaries found. Create your first beneficiary.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {beneficiaries.map((beneficiary: any) => {
            const id = beneficiary.id || beneficiary._id;
            const disbursementTypeId =
              typeof beneficiary.disbursementType === 'string'
                ? beneficiary.disbursementType
                : beneficiary.disbursementType?._id || beneficiary.disbursementType?.id;
            const disbursementType = disbursementTypeById.get(disbursementTypeId);
            return (
              <div key={id} className="glass-card rounded-xl p-6 group">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold gradient-text group-hover:opacity-80 transition-opacity">
                    {beneficiary.name || beneficiary.email}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      beneficiary.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {beneficiary.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {beneficiary.email && <p className="mt-2 text-sm text-muted-foreground">{beneficiary.email}</p>}
                {beneficiary.phone && (
                  <p className="mt-1 text-sm text-muted-foreground">Phone: {beneficiary.phone}</p>
                )}
                {disbursementType && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Type: {disbursementType.name}
                  </p>
                )}
                {(beneficiary.bankName || beneficiary.accountNumber) && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {beneficiary.bankName ? `${beneficiary.bankName}` : 'Bank'} {beneficiary.accountNumber ? `• ${beneficiary.accountNumber}` : ''}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Created: {beneficiary.createdAt ? new Date(beneficiary.createdAt).toLocaleDateString() : '-'}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => handleOpenEdit(beneficiary)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDeleteBeneficiary(beneficiary)}
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
            <ModalTitle>Create Beneficiary</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Beneficiary Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (createErrors.name) {
                      setCreateErrors((prev) => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholder="Beneficiary name"
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-foreground ${
                    createErrors.name ? 'border-destructive' : 'border-input'
                  } bg-background`}
                />
                {createErrors.name && (
                  <p className="mt-1 text-xs text-destructive">{createErrors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                  <option value="supplier">Supplier</option>
                  <option value="employee">Employee</option>
                  <option value="other">Other</option>
                </select>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Disbursement Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.disbursementType}
                    onChange={(e) => {
                      setFormData({ ...formData, disbursementType: e.target.value });
                      if (createErrors.disbursementType) {
                        setCreateErrors((prev) => ({ ...prev, disbursementType: '' }));
                      }
                    }}
                    className={`mt-1 w-full rounded-md border px-3 py-2 text-foreground ${
                      createErrors.disbursementType ? 'border-destructive' : 'border-input'
                    } bg-background`}
                  >
                    <option value="">Select disbursement type</option>
                    {disbursementTypes.map((type: any) => (
                      <option key={type.id || type._id} value={type.id || type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {createErrors.disbursementType && (
                    <p className="mt-1 text-xs text-destructive">{createErrors.disbursementType}</p>
                  )}
                </div>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Bank name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Account number"
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
            <Button
              onClick={handleCreateBeneficiary}
              disabled={createMutation.isPending || !formData.name || !formData.disbursementType}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Beneficiary'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg">
          <ModalHeader>
            <ModalTitle>Edit Beneficiary</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Beneficiary Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, name: e.target.value });
                    if (editErrors.name) {
                      setEditErrors((prev) => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholder="Beneficiary name"
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-foreground ${
                    editErrors.name ? 'border-destructive' : 'border-input'
                  } bg-background`}
                />
                {editErrors.name && (
                  <p className="mt-1 text-xs text-destructive">{editErrors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                  <option value="supplier">Supplier</option>
                  <option value="employee">Employee</option>
                  <option value="other">Other</option>
                </select>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Disbursement Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={editFormData.disbursementType}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, disbursementType: e.target.value });
                      if (editErrors.disbursementType) {
                        setEditErrors((prev) => ({ ...prev, disbursementType: '' }));
                      }
                    }}
                    className={`mt-1 w-full rounded-md border px-3 py-2 text-foreground ${
                      editErrors.disbursementType ? 'border-destructive' : 'border-input'
                    } bg-background`}
                  >
                    <option value="">Select disbursement type</option>
                    {disbursementTypes.map((type: any) => (
                      <option key={type.id || type._id} value={type.id || type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {editErrors.disbursementType && (
                    <p className="mt-1 text-xs text-destructive">{editErrors.disbursementType}</p>
                  )}
                </div>
              </div>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
                <input
                  type="text"
                  value={editFormData.bankName}
                  onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })}
                  placeholder="Bank name"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                />
              </div>
              <input
                type="text"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                placeholder="Address"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
              <input
                type="text"
                value={editFormData.accountNumber}
                onChange={(e) => setEditFormData({ ...editFormData, accountNumber: e.target.value })}
                placeholder="Account number"
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
            <Button
              onClick={handleUpdateBeneficiary}
              disabled={
                updateMutation.isPending ||
                !editFormData.name ||
                !editFormData.disbursementType
              }
            >
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

export default function BeneficiariesPage() {
  return (
    <ProtectedRoute requiredRoles={['kaeyros_super_admin', 'kaeyros_admin', 'company_super_admin']}>
      <BeneficiariesContent />
    </ProtectedRoute>
  );
}
