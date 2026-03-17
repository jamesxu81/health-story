'use client';

/**
 * TreatmentForm Component
 * Allows users to add and edit treatments for an illness
 * Supports effective/ineffective tracking and optional end dates
 */

import React, { useState, useCallback } from 'react';
import { CreateTreatmentPayload, UpdateTreatmentPayload } from '@/types/treatment';

interface TreatmentFormProps {
  illnessId: string;
  onSubmit: (payload: CreateTreatmentPayload | UpdateTreatmentPayload) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateTreatmentPayload>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function TreatmentForm({
  illnessId,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  isLoading = false,
}: TreatmentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || ('medicine' as const),
    effectiveness: initialData?.effectiveness || ('unknown' as const),
    started_at: initialData?.started_at || new Date().toISOString().slice(0, 16),
    ended_at: initialData?.ended_at || '',
    notes: initialData?.notes || '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  }, []);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Treatment name is required');
      return false;
    }

    if (isEditing === false && !formData.started_at) {
      setError('Start date is required');
      return false;
    }

    if (formData.ended_at && formData.started_at && formData.ended_at < formData.started_at) {
      setError('End date cannot be earlier than start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = isEditing
        ? ({
            name: formData.name,
            effectiveness: formData.effectiveness,
            ended_at: formData.ended_at || null,
            notes: formData.notes || null,
          } as UpdateTreatmentPayload)
        : ({
            name: formData.name,
            type: formData.type,
            effectiveness: formData.effectiveness,
            started_at: formData.started_at,
            ended_at: formData.ended_at || null,
            notes: formData.notes || null,
          } as CreateTreatmentPayload);

      await onSubmit(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit treatment';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Treatment Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
          Treatment Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Paracetamol 500mg, Rest and fluids"
          disabled={isSubmitting || isLoading}
          maxLength={255}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Treatment Type */}
      {!isEditing && (
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
            Treatment Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={isSubmitting || isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="medicine">Medicine</option>
            <option value="home_remedy">Home Remedy</option>
            <option value="doctor_recommendation">Doctor Recommendation</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      {/* Effectiveness */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Effectiveness Status *
        </label>
        <div className="flex gap-3">
          {(['unknown', 'effective', 'ineffective'] as const).map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="effectiveness"
                value={status}
                checked={formData.effectiveness === status}
                onChange={handleChange}
                disabled={isSubmitting || isLoading}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700 capitalize">
                {status === 'unknown' && '❓ Unknown'}
                {status === 'effective' && '✓ Effective'}
                {status === 'ineffective' && '✗ Ineffective'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Start Date */}
      {!isEditing && (
        <div>
          <label htmlFor="started_at" className="block text-sm font-medium text-slate-700 mb-1">
            Start Date & Time *
          </label>
          <input
            id="started_at"
            name="started_at"
            type="datetime-local"
            value={formData.started_at}
            onChange={handleChange}
            disabled={isSubmitting || isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      )}

      {/* End Date */}
      <div>
        <label htmlFor="ended_at" className="block text-sm font-medium text-slate-700 mb-1">
          End Date & Time (optional)
        </label>
        <input
          id="ended_at"
          name="ended_at"
          type="datetime-local"
          value={formData.ended_at}
          onChange={handleChange}
          disabled={isSubmitting || isLoading}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <p className="text-xs text-slate-500 mt-1">Leave empty if treatment is ongoing</p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="e.g., Took every 4 hours, side effects: mild nausea"
          disabled={isSubmitting || isLoading}
          maxLength={1000}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <p className="text-xs text-slate-500 mt-1">
          {formData.notes.length}/1000
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || isLoading ? 'Saving...' : isEditing ? 'Update Treatment' : 'Add Treatment'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
          className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-md font-medium hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
