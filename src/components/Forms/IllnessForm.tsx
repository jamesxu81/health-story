'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SymptomInput } from './SymptomInput';
import { MemberPicker } from '@/components/Family/MemberPicker';
import { Symptom, IllnessInput } from '@/types/illness';

interface IllnessFormProps {
  onSuccess?: (illnessId: string) => void;
  onCancel?: () => void;
  initialData?: {
    id: string;
    name: string;
    date_started: Date | string;
    date_ended: Date | string | null;
    symptoms: Symptom[];
    cause: string | null;
    treat: string | null;
    notes: string | null;
    family_member_id: string | null;
  };
}

const inputClasses =
  'w-full px-4 py-3 bg-white border border-black/10 rounded-[10px] text-sm text-vital-ink placeholder:text-vital-muted-2 focus:ring-2 focus:ring-vital-teal/20 focus:border-vital-teal transition-colors';

const ATTACHMENT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf';

function toDateString(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? d : d.toISOString();
  return date.split('T')[0];
}

export function IllnessForm({ onSuccess, onCancel, initialData }: IllnessFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    date_started: toDateString(initialData?.date_started) || new Date().toISOString().split('T')[0],
    date_ended: toDateString(initialData?.date_ended),
    symptoms: initialData?.symptoms ?? ([] as Symptom[]),
    cause: initialData?.cause ?? '',
    treat: initialData?.treat ?? '',
    notes: initialData?.notes ?? '',
    family_member_id: initialData?.family_member_id ?? null as string | null,
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSymptomsChange = useCallback((symptoms: Symptom[]) => {
    setFormData((prev) => ({ ...prev, symptoms }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        if (!formData.name.trim()) throw new Error('name is required');
        if (!formData.date_started) throw new Error('date is required');

        const payload: IllnessInput = {
          name: formData.name.trim(),
          date_started: formData.date_started,
          date_ended: formData.date_ended || null,
          symptoms: formData.symptoms,
          cause: formData.cause.trim() || null,
          treat: formData.treat.trim() || null,
          notes: formData.notes.trim() || null,
          family_member_id: formData.family_member_id,
        };

        const authToken = localStorage.getItem('auth_token') || 'default-user';
        const url = isEditing ? `/api/illnesses/${initialData.id}` : '/api/illnesses';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
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
        const illnessId = data.id as string;

        if (attachment) {
          const fd = new FormData();
          fd.append('file', attachment);
          const uploadRes = await fetch(`/api/illnesses/${illnessId}/photos`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: fd,
          });
          if (!uploadRes.ok) {
            let msg = 'Failed to upload attachment';
            try {
              const errBody = await uploadRes.json();
              if (errBody?.error) msg = errBody.error;
            } catch {
              /* ignore */
            }
            throw new Error(msg);
          }
          setAttachment(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }

        if (onSuccess) {
          onSuccess(illnessId);
        } else {
          router.push('/history');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [formData, attachment, onSuccess, router, isEditing, initialData]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-vital-red-light border border-vital-red/20 rounded-[14px]">
          <p className="text-sm font-medium text-vital-red">{error}</p>
        </div>
      )}

      <MemberPicker
        value={formData.family_member_id}
        onChange={(id) => setFormData((prev) => ({ ...prev, family_member_id: id }))}
      />

      <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
              Illness Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Common Cold, Flu, Headache"
              className={inputClasses}
              maxLength={255}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date_started" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
                Date Started *
              </label>
              <input
                id="date_started"
                type="date"
                name="date_started"
                value={formData.date_started}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="date_ended" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
                Date Ended
              </label>
              <input
                id="date_ended"
                type="date"
                name="date_ended"
                value={formData.date_ended}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </div>

      <SymptomInput symptoms={formData.symptoms} onChange={handleSymptomsChange} />

      <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="cause" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
              What might have caused it?
            </label>
            <input
              id="cause"
              type="text"
              name="cause"
              value={formData.cause}
              onChange={handleInputChange}
              placeholder="e.g., Exposure at school, Ate bad food"
              className={inputClasses}
              maxLength={1000}
            />
          </div>

          <div>
            <label htmlFor="treat" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
              Treatment
            </label>
            <textarea
              id="treat"
              name="treat"
              value={formData.treat}
              onChange={handleInputChange}
              placeholder="e.g., Rest, fluids, medicine, what seemed to help"
              rows={2}
              className={inputClasses + ' resize-none'}
              maxLength={2000}
            />
          </div>

          <div>
            <label htmlFor="attachment" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
              Attachment (optional)
            </label>
            <p className="text-[12px] text-vital-muted mb-2">Image or PDF, up to 25&nbsp;MB.</p>
            <input
              ref={fileInputRef}
              id="attachment"
              type="file"
              accept={ATTACHMENT_ACCEPT}
              className={`${inputClasses} py-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-medium file:bg-vital-teal-light file:text-vital-teal`}
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setAttachment(f);
              }}
            />
            {attachment && (
              <div className="mt-2 flex items-center justify-between gap-2 text-[12px] text-vital-ink">
                <span className="truncate">{attachment.name}</span>
                <button
                  type="button"
                  className="shrink-0 text-vital-teal font-medium hover:underline"
                  onClick={() => {
                    setAttachment(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
              Notes for your future self
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Anything else you want to remember..."
              rows={3}
              className={inputClasses + ' resize-none'}
              maxLength={5000}
            />
          </div>
        </div>
      </div>

      <div className="pt-3 pb-4 grid grid-cols-[1fr_auto] gap-3">
        <button
          type="submit"
          disabled={loading}
          className="py-3 bg-vital-teal hover:bg-vital-teal-hover active:opacity-95 disabled:bg-black/10 disabled:text-vital-muted-2 text-white text-[13px] font-medium rounded-lg transition-colors h-12 min-w-0"
        >
          {loading ? 'Saving...' : isEditing ? 'Update record' : 'Save to timeline'}
        </button>
        <button
          type="button"
          onClick={() => onCancel ? onCancel() : router.back()}
          className="px-6 py-3 text-[13px] font-medium text-vital-ink border border-black/10 rounded-lg bg-white hover:bg-vital-canvas transition-colors h-12"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
