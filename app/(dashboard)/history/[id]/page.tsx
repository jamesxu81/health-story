'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { IllnessDetail } from '@/components/Detail/IllnessDetail';
import { Illness } from '@/types/illness';

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [illness, setIllness] = useState<(Illness & { treatments: any[]; photos: any[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIllness = async () => {
      try {
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
    };
    if (id) fetchIllness();
  }, [id]);

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 min-h-[44px] inline-flex items-center"
        >
          ← Back
        </button>
        <div className="p-5 bg-white rounded-2xl shadow-sm">
          <p className="text-sm text-red-600">{error || 'Illness not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 min-h-[44px] inline-flex items-center gap-1"
      >
        ← Back to timeline
      </button>
      <IllnessDetail illness={illness} />
    </div>
  );
}
