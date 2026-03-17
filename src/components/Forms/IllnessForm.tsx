'use client';

/**
 * IllnessForm Component
 * Form for creating and editing illness records
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SymptomInput } from './SymptomInput';
import { Symptom, IllnessInput } from '@/types/illness';

interface IllnessFormProps {
  onSuccess?: (illnessId: string) => void;
}

export function IllnessForm({ onSuccess }: IllnessFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    date_started: new Date().toISOString().split('T')[0], // Today's date
    date_ended: '',
    symptoms: [] as Symptom[],
    cause: '',
    notes: '',
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSymptomsChange = useCallback((symptoms: Symptom[]) => {
    setFormData((prev) => ({
      ...prev,
      symptoms,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        // Validate required fields
        if (!formData.name.trim()) {
          throw new Error('name is required');
        }
        if (!formData.date_started) {
          throw new Error('date is required');
        }

        const payload: IllnessInput = {
          name: formData.name.trim(),
          date_started: formData.date_started,
          date_ended: formData.date_ended || null,
          symptoms: formData.symptoms,
          cause: formData.cause.trim() || null,
          notes: formData.notes.trim() || null,
        };

        // Get auth token from localStorage (for MVP)
        const authToken = localStorage.getItem('auth_token') || 'default-user';

        const response = await fetch('/api/illnesses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save illness');
        }

        const { data } = await response.json();

        // Call success callback or redirect
        if (onSuccess) {
          onSuccess(data.id);
        } else {
          router.push(`/history`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [formData, onSuccess, router]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Illness name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          Illness Name *
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Common Cold, Flu, Headache"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
          minLength={1}
          maxLength={255}
        />
        <p className="mt-1 text-xs text-slate-500">{formData.name.length}/255 characters</p>
      </div>

      {/* Start date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date_started" className="block text-sm font-medium text-slate-700 mb-2">
            Date Started *
          </label>
          <input
            id="date_started"
            type="date"
            name="date_started"
            value={formData.date_started}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
          />
        </div>

        {/* End date */}
        <div>
          <label htmlFor="date_ended" className="block text-sm font-medium text-slate-700 mb-2">
            Date Ended (if resolved)
          </label>
          <input
            id="date_ended"
            type="date"
            name="date_ended"
            value={formData.date_ended}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
          />
        </div>
      </div>

      {/* Symptoms */}
      <SymptomInput symptoms={formData.symptoms} onChange={handleSymptomsChange} />

      {/* Cause */}
      <div>
        <label htmlFor="cause" className="block text-sm font-medium text-slate-700 mb-2">
          Likely Cause
        </label>
        <input
          id="cause"
          type="text"
          name="cause"
          value={formData.cause}
          onChange={handleInputChange}
          placeholder="e.g., Exposure at work, Ate bad food"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
          maxLength={1000}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any additional information about this illness..."
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
          maxLength={5000}
        />
        <p className="mt-1 text-xs text-slate-500">{formData.notes.length}/5000 characters</p>
      </div>

      {/* Submit button */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors min-h-[44px]"
        >
          {loading ? 'Saving...' : 'Save Illness Record'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
