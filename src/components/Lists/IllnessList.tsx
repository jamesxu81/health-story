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
      <div className="p-5 bg-white rounded-[14px] border border-black/10">
        <p className="text-sm text-vital-red">{error}</p>
      </div>
    );
  }

  if (loading && illnesses.length === 0 && !debouncedSearch) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[72px] bg-white rounded-xl border border-black/10 animate-pulse" />
        ))}
      </div>
    );
  }

  const hasSearch = debouncedSearch.trim().length > 0;
  const isEmpty = illnesses.length === 0;

  if (isEmpty && !hasSearch) {
    return (
      <div className="p-10 text-center bg-white rounded-[14px] border border-black/10">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-vital-canvas flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-vital-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-vital-ink">
          {status === 'active'
            ? 'No active illnesses recorded.'
            : status === 'resolved'
              ? 'No resolved illnesses recorded.'
              : 'No illnesses recorded yet.'}
        </p>
        <p className="text-[12px] text-vital-muted mt-1">Start by recording your first illness.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <div className="relative flex-1 flex items-center gap-3 bg-white border border-black/10 rounded-[10px] px-4 min-h-[44px] focus-within:ring-2 focus-within:ring-vital-teal/20 focus-within:border-vital-teal transition-shadow">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-vital-muted shrink-0 pointer-events-none"
            aria-hidden
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search records, conditions..."
            className="flex-1 min-w-0 py-2.5 bg-transparent border-0 text-sm text-vital-ink placeholder:text-vital-muted-2 outline-none focus:ring-0"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(0); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/10 hover:bg-black/15 flex items-center justify-center transition-colors"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3 text-vital-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => { setSortOrder((prev) => prev === 'desc' ? 'asc' : 'desc'); setPage(0); }}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-black/10 rounded-[10px] text-[13px] font-medium text-vital-ink hover:bg-vital-canvas transition-colors h-11"
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
        <div className="p-10 text-center bg-white rounded-[14px] border border-black/10">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-vital-canvas flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-vital-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-vital-ink">
            No results for &ldquo;{debouncedSearch}&rdquo;
          </p>
          <p className="text-[12px] text-vital-muted mt-1">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {illnesses.map((illness) => (
              <IllnessCard key={illness.id} illness={illness} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0 || loading}
                className="px-4 py-2 bg-white rounded-full border border-black/10 text-[13px] font-medium text-vital-muted hover:bg-vital-canvas disabled:opacity-40 disabled:cursor-not-allowed h-9 transition-colors"
              >
                &larr; Previous
              </button>
              <span className="text-sm text-vital-ink font-semibold min-w-[72px] text-center font-display">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1 || loading}
                className="px-4 py-2 bg-white rounded-full border border-black/10 text-[13px] font-medium text-vital-muted hover:bg-vital-canvas disabled:opacity-40 disabled:cursor-not-allowed h-9 transition-colors"
              >
                Next &rarr;
              </button>
            </div>
          )}

          {loading && illnesses.length > 0 && (
            <div className="text-center text-[12px] text-vital-muted">Loading...</div>
          )}
        </>
      )}
    </div>
  );
}
