'use client';

import { Disbursement } from "@/src/types";

// import { Disbursement } from '@/types';

interface WorkflowTimelineProps {
  disbursement: Disbursement;
}

const stages = [
  { id: 'draft', label: 'Draft', icon: '📝' },
  { id: 'department_head', label: 'Department Head', icon: '👔' },
  { id: 'validator', label: 'Validator', icon: '✓' },
  { id: 'cashier', label: 'Disbursed', icon: '💰' },
];

export function WorkflowTimeline({ disbursement }: WorkflowTimelineProps) {
  const getCurrentStageIndex = () => {
    const statusToStageMap: Record<string, number> = {
      draft: 0,
      pending_department_head: 1,
      pending_validator: 2,
      pending_cashier: 3,
      approved: 3,
      disbursed: 4,
    };
    return statusToStageMap[disbursement.status] || 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <div className="py-8">
      <h3 className="text-lg font-semibold text-foreground mb-6">Approval Workflow</h3>

      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center flex-1">
            {/* Circle */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-semibold ${
                index < currentStageIndex
                  ? 'border-green-500 bg-green-100 text-green-700'
                  : index === currentStageIndex
                    ? 'border-blue-500 bg-blue-100 text-blue-700'
                    : 'border-gray-300 bg-gray-100 text-gray-500'
              }`}
            >
              {index < currentStageIndex ? '✓' : stage.icon}
            </div>

            {/* Label */}
            <p
              className={`mt-2 text-center text-xs font-medium ${
                index <= currentStageIndex ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {stage.label}
            </p>

            {/* Connector line */}
            {index < stages.length - 1 && (
              <div
                className={`absolute top-6 left-[calc(50%+24px)] w-[calc(100%/4)] border-t-2 ${
                  index < currentStageIndex - 1 ? 'border-green-500' : 'border-gray-300'
                }`}
                style={{
                  width: `calc(100% / ${stages.length} - 24px)`,
                  left: 'calc(50% + 24px)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Stage Info */}
      {disbursement.approvals && disbursement.approvals.length > 0 && (
        <div className="mt-8 space-y-4 border-t border-border pt-6">
          <h4 className="font-semibold text-foreground">Approval History</h4>
          {disbursement.approvals.map((approval, index) => (
            <div key={index} className="flex items-start gap-4 text-sm">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-foreground">{approval.approver_name}</div>
                <div className="text-muted-foreground">{approval.stage}</div>
                {approval.notes && <div className="mt-1 text-xs italic text-muted-foreground">{approval.notes}</div>}
                <div className="mt-1 text-xs text-muted-foreground">{approval.approved_at}</div>
              </div>
              <div className={`text-xs font-semibold ${approval.action === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                {approval.action.charAt(0).toUpperCase() + approval.action.slice(1)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
