'use client';

/**
 * TreatmentList Component
 * Displays treatments for an illness with effectiveness status and edit/delete actions
 */

import React from 'react';
import Link from 'next/link';
import { Treatment } from '@/types/treatment';

interface TreatmentListProps {
  illnessId: string;
  treatments: Treatment[];
  onEdit?: (treatment: Treatment) => void;
  onDelete?: (treatmentId: string) => Promise<void>;
  isLoading?: boolean;
}

export function TreatmentList({
  illnessId,
  treatments,
  onEdit,
  onDelete,
  isLoading = false,
}: TreatmentListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (treatmentId: string) => {
    if (!onDelete) return;

    if (!confirm('Are you sure you want to delete this treatment?')) return;

    setDeletingId(treatmentId);
    try {
      await onDelete(treatmentId);
    } finally {
      setDeletingId(null);
    }
  };

  const getEffectivenessStyle = (effectiveness: 'effective' | 'ineffective' | 'unknown') => {
    switch (effectiveness) {
      case 'effective':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ineffective':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'unknown':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getEffectivenessLabel = (effectiveness: string) => {
    switch (effectiveness) {
      case 'effective':
        return '✓ Effective';
      case 'ineffective':
        return '✗ Ineffective';
      case 'unknown':
        return '❓ Unknown';
      default:
        return effectiveness;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      medicine: '💊',
      home_remedy: '🏥',
      doctor_recommendation: '👨‍⚕️',
      other: '•',
    };
    return `${typeMap[type] || '•'} ${type.replace(/_/g, ' ')}`;
  };

  if (treatments.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-slate-600 mb-3">No treatments recorded yet.</p>
        <p className="text-sm text-slate-500">Add a treatment to track what you're using.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {treatments.map((treatment) => {
        const startDate = new Date(treatment.started_at).toLocaleDateString();
        const endDate = treatment.ended_at
          ? new Date(treatment.ended_at).toLocaleDateString()
          : 'Ongoing';
        const isOngoing = !treatment.ended_at;

        return (
          <div
            key={treatment.id}
            className="p-4 border border-slate-200 rounded-lg bg-white hover:shadow-md transition-shadow"
            data-testid="treatment-item"
          >
            {/* Header: Name and Type */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-slate-900">{treatment.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{getTypeLabel(treatment.type)}</p>
              </div>

              {/* Effectiveness Badge */}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getEffectivenessStyle(treatment.effectiveness)}`}
              >
                {getEffectivenessLabel(treatment.effectiveness)}
              </span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
              <span>📅</span>
              <span>
                {startDate}
                {!isOngoing && ` → ${endDate}`}
                {isOngoing && ` → Ongoing`}
              </span>
            </div>

            {/* Notes if present */}
            {treatment.notes && (
              <p className="text-sm text-slate-700 mb-3 p-2 bg-slate-50 rounded italic border-l-2 border-slate-300">
                "{treatment.notes}"
              </p>
            )}

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                {onEdit && (
                  <button
                    onClick={() => onEdit(treatment)}
                    disabled={isLoading || deletingId === treatment.id}
                    className="flex-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => handleDelete(treatment.id)}
                    disabled={isLoading || deletingId === treatment.id}
                    className="flex-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
                  >
                    {deletingId === treatment.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
