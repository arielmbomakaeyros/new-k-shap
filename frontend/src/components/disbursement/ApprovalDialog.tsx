'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useApproveDisbursement, useRejectDisbursement } from '@/src/hooks/queries';
import { useAuthStore } from '@/src/store/authStore';
// import { useApi } from '@/hooks/useApi';

const approvalSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
    notes: z.string().trim().optional(),
    reason: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === 'reject') {
      if (!data.reason || data.reason.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reason'],
          message: 'Reason required',
        });
      }
    }
  });

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface ApprovalDialogProps {
  disbursementId: string;
  stage: 'department_head' | 'validator' | 'cashier';
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApprovalDialog({
  disbursementId,
  stage,
  onClose,
  onSuccess,
}: ApprovalDialogProps) {
  const approveMutation = useApproveDisbursement();
  const rejectMutation = useRejectDisbursement();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: { action: 'approve', notes: '', reason: '' },
  });

  const action = watch('action');

  const onSubmit = async (data: ApprovalFormData) => {
    setIsSubmitting(true);
    try {
      if (data.action === 'approve') {
        await approveMutation.mutateAsync({
          id: disbursementId,
          data: { notes: data.notes },
        });
      } else {
        await rejectMutation.mutateAsync({
          id: disbursementId,
          data: { reason: data.reason || data.notes || 'Rejected' },
        });
      }
      onSuccess?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-card p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">Approval Request</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {user?.firstName} {user?.lastName} • {stage.replace('_', ' ')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Action</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input {...register('action')} type="radio" value="approve" />
                <span className="text-sm">Approve</span>
              </label>
              <label className="flex items-center gap-2">
                <input {...register('action')} type="radio" value="reject" />
                <span className="text-sm">Reject</span>
              </label>
            </div>
          </div>

          {action === 'reject' && (
            <div>
              <label className="block text-sm font-medium text-foreground">
                Rejection Reason
              </label>
              <textarea
                {...register('reason')}
                placeholder="Please provide details"
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
              />
              {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
            </div>
          )}

          {action === 'approve' && (
            <div>
              <label className="block text-sm font-medium text-foreground">
                Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                placeholder="Add any notes"
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className='gradient-bg-primary text-white flex-1'>
              {isSubmitting ? 'Processing...' : 'Submit'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
