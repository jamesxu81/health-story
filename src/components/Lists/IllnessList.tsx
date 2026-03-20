'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 300);
  }, []);

  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

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
          sort_order: sortOrder,
        });
        if (status) params.append('status', status);
        if (familyMemberId) params.append('family_member_id', familyMemberId);
        if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());

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
  }, [offset, status, initialData.length, familyMemberId, debouncedSearch, sortOrder]);

  if (error) {
    return (
      <div className="p-5 bg-white rounded-2xl shadow-card border border-slate-200/60">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (loading && illnesses.length === 0 && !debouncedSearch) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl shadow-card border border-slate-200/60 animate-pulse" />
        ))}
      </div>
    );
  }

  const hasSearch = debouncedSearch.trim().length > 0;
  const isEmpty = illnesses.length === 0;

  if (isEmpty && !hasSearch) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl shadow-card border border-slate-200/60">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">
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
      {/* Search & sort controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or cause..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors min-h-[44px]"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(0); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => { setSortOrder((prev) => prev === 'desc' ? 'asc' : 'desc'); setPage(0); }}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
          title={sortOrder === 'desc' ? 'Showing newest first' : 'Showing oldest first'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            {sortOrder === 'desc' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21l3.75-3.75" />
            )}
          </svg>
          {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
        </button>
      </div>

      {isEmpty && hasSearch ? (
        <div className="p-10 text-center bg-white rounded-2xl shadow-card border border-slate-200/60">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">
            No results for &ldquo;{debouncedSearch}&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {illnesses.map((illness) => (
              <IllnessCard key={illness.id} illness={illness} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="px-4 py-2.5 bg-white rounded-xl shadow-card border border-slate-200/60 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] transition-colors"
              >
                &larr; Previous
              </button>
              <span className="text-sm text-slate-500 font-medium min-w-[60px] text-center">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="px-4 py-2.5 bg-white rounded-xl shadow-card border border-slate-200/60 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          )}

          {loading && illnesses.length > 0 && (
            <div className="text-center text-xs text-slate-400">Loading...</div>
          )}
        </>
      )}
    </div>
  );
}
