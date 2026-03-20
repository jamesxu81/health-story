'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IllnessDetail } from '@/components/Detail/IllnessDetail';
import { IllnessForm } from '@/components/Forms/IllnessForm';
import { Illness } from '@/types/illness';

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [illness, setIllness] = useState<(Illness & { treatments: any[]; photos: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchIllness = useCallback(async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('auth_token') || 'default-user';
      const response = await fetch(`/api/illnesses/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error('Illness not found');
      const data = await response.json();
      setIllness(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load illness details';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchIllness();
  }, [id, fetchIllness]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !illness) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm font-medium text-slate-600 hover:text-slate-900 min-h-[44px] inline-flex items-center gap-1.5 px-3 -ml-3 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="p-5 bg-white rounded-2xl shadow-card border border-slate-200/60">
          <p className="text-sm text-red-600">{error || 'Illness not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <button
        onClick={() => isEditing ? setIsEditing(false) : router.back()}
        className="mb-5 text-sm font-medium text-slate-600 hover:text-slate-900 min-h-[44px] inline-flex items-center gap-1.5 px-3 -ml-3 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {isEditing ? 'Back to details' : 'Back to timeline'}
      </button>

      {isEditing ? (
        <>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Edit record</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6 sm:mb-8">Update the details of this illness record.</p>
          <IllnessForm
            initialData={illness}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              fetchIllness();
            }}
          />
        </>
      ) : (
        <IllnessDetail illness={illness} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
