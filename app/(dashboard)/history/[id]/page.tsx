'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { IllnessDetail } from '@/src/components/Detail/IllnessDetail';
import { Illness } from '@/types/illness';

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [illness, setIllness] = useState<(Illness & { treatments: any[]; photos: any[] }) | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIllness = async () => {
      try {
        const authToken = localStorage.getItem('auth_token') || 'default-user';

        const response = await fetch(`/api/illnesses/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Illness not found');
        }

        const data = await response.json();
        setIllness(data.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load illness details';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIllness();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !illness) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 px-3 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50 rounded-md"
          >
            ← Back
          </button>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error || 'Illness not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Header with back button */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="mb-4 px-3 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50 rounded-md inline-flex items-center gap-1"
          >
            ← Back to History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IllnessDetail illness={illness} />
      </div>
    </div>
  );
}
