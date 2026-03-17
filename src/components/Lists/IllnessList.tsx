'use client';

/**
 * IllnessList Component
 * Displays paginated list of illness records
 * Handles loading, empty states, and pagination
 */

import React, { useState, useEffect } from 'react';
import { IllnessCard } from '@/src/components/Cards/IllnessCard';
import { IllnessWithCounts } from '@/types/illness';

interface IllnessListProps {
  initialData?: IllnessWithCounts[];
  totalCount?: number;
  status?: 'active' | 'resolved' | undefined;
}

export function IllnessList({ initialData = [], totalCount = 0, status }: IllnessListProps) {
  const [illnesses, setIllnesses] = useState<IllnessWithCounts[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(totalCount);

  const LIMIT = 10;
  const offset = page * LIMIT;
  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    // Only fetch if no initial data provided
    if (initialData.length > 0) {
      return;
    }

    const fetchIllnesses = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: LIMIT.toString(),
          offset: offset.toString(),
        });

        if (status) {
          params.append('status', status);
        }

        const authToken = localStorage.getItem('auth_token') || 'default-user';

        const response = await fetch(`/api/illnesses?${params}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
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
        console.error('IllnessList fetch error:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchIllnesses();
  }, [page, status, initialData.length]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    );
  }

  if (loading && illnesses.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (illnesses.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-slate-600">
          {status === 'active'
            ? 'No active illnesses recorded.'
            : status === 'resolved'
              ? 'No resolved illnesses recorded.'
              : 'No illnesses recorded yet.'}
        </p>
        <p className="text-sm text-slate-500 mt-2">Start by recording your first illness.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Illness cards list */}
      <div className="space-y-3">
        {illnesses.map((illness) => (
          <IllnessCard key={illness.id} illness={illness} />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0 || loading}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            ← Previous
          </button>

          <span className="text-sm text-slate-600 min-w-[100px] text-center">
            Page {page + 1} of {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Next →
          </button>
        </div>
      )}

      {/* Loading indicator for page changes */}
      {loading && illnesses.length > 0 && (
        <div className="text-center text-sm text-slate-500">Loading...</div>
      )}
    </div>
  );
}
