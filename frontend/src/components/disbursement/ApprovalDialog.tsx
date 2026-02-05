'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useApi } from '@/src/hooks/useApi';
// import { useApi } from '@/hooks/useApi';

const approvalSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_changes']),
  notes: z.string().min(5, 'Notes required').optional(),
  conditions: z.array(z.string()).optional(),
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
  const { fetchAPI } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
  });

  const action = watch('action');

  const onSubmit = async (data: ApprovalFormData) => {
    setIsSubmitting(true);
    try {
      await fetchAPI(`/api/disbursements/${disbursementId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          action: data.action,
          stage,
          notes: data.notes,
        }),
      });
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Action</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input {...register('action')} type="radio" value="approve" />
                <span className="text-sm">Approve</span>
              </label>
              <label className="flex items-center gap-2">
                <input {...register('action')} type="radio" value="request_changes" />
                <span className="text-sm">Request Changes</span>
              </label>
              <label className="flex items-center gap-2">
                <input {...register('action')} type="radio" value="reject" />
                <span className="text-sm">Reject</span>
              </label>
            </div>
          </div>

          {action !== 'approve' && (
            <div>
              <label className="block text-sm font-medium text-foreground">
                {action === 'reject' ? 'Rejection Reason' : 'Requested Changes'}
              </label>
              <textarea
                {...register('notes')}
                placeholder="Please provide details"
                rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
              />
              {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes.message}</p>}
            </div>
          )}

          {action === 'approve' && stage !== 'cashier' && (
            <div>
              <label className="block text-sm font-medium text-foreground">
                Conditions (Optional)
              </label>
              <textarea
                {...register('conditions')}
                placeholder="Any conditions for approval"
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
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
