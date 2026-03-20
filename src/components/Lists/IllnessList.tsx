'use client';

import React, { useState, useEffect } from 'react';
import { IllnessCard } from '@/components/Cards/IllnessCard';
import { IllnessWithCounts } from '@/types/illness';
import { useFamilyFocus } from '@/context/FamilyFocusContext';

interface IllnessListProps {
  initialData?: IllnessWithCounts[];
  totalCount?: number;
  status?: 'active' | 'resolved' | undefined;
}

export function IllnessList({ initialData = [], totalCount = 0, status }: IllnessListProps) {
  const focus = useFamilyFocus();
  const familyMemberId = focus?.familyMemberId ?? null;

  const [illnesses, setIllnesses] = useState<IllnessWithCounts[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(totalCount);

  const LIMIT = 10;
  const offset = page * LIMIT;
  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    if (initialData.length > 0) return;

    const fetchIllnesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          limit: LIMIT.toString(),
          offset: offset.toString(),
        });
        if (status) params.append('status', status);
        if (familyMemberId) params.append('family_member_id', familyMemberId);

        const authToken = localStorage.getItem('auth_token') || 'default-user';
        const response = await fetch(`/api/illnesses?${params}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch illnesses (${response.status})`);
        }
        const data = await response.json();
        setIllnesses(data.data);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchIllnesses();
  }, [offset, status, initialData.length, familyMemberId]);

  if (error) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (loading && illnesses.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl shadow-sm animate-pulse" />
        ))}
      </div>
    );
  }

  if (illnesses.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm">
        <p className="text-sm text-slate-500">
          {status === 'active'
            ? 'No active illnesses recorded.'
            : status === 'resolved'
              ? 'No resolved illnesses recorded.'
              : 'No illnesses recorded yet.'}
        </p>
        <p className="text-xs text-slate-400 mt-1">Start by recording your first illness.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {illnesses.map((illness) => (
          <IllnessCard key={illness.id} illness={illness} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
            className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            ← Previous
          </button>
          <span className="text-xs text-slate-400 min-w-[80px] text-center">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Next →
          </button>
        </div>
      )}

      {loading && illnesses.length > 0 && (
        <div className="text-center text-xs text-slate-400">Loading...</div>
      )}
    </div>
  );
}
