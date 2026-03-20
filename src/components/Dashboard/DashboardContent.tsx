'use client';

import { useState, useEffect, useCallback } from 'react';
import { IllnessWithCounts } from '@/types/illness';
import { useFamilyFocus } from '@/context/FamilyFocusContext';
import { EmptyState } from './EmptyState';
import { ActiveIllnessCards } from './ActiveIllnessCards';
import { ActivityFeed, ActivityEvent } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { StatsSnapshot, DashboardStats } from './StatsSnapshot';

interface DashboardData {
  active_illnesses: IllnessWithCounts[];
  recent_activity: ActivityEvent[];
  stats: DashboardStats;
}

export function DashboardContent() {
  const focus = useFamilyFocus();
  const familyMemberId = focus?.familyMemberId ?? null;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreActivity, setHasMoreActivity] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem('auth_token') || 'default-user';
      const qs = new URLSearchParams();
      if (familyMemberId) qs.set('family_member_id', familyMemberId);
      const q = qs.toString();
      const res = await fetch(`/api/dashboard${q ? `?${q}` : ''}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load dashboard (${res.status})`);
      }
      const json = await res.json();
      setData(json.data);
      setHasMoreActivity(json.data.recent_activity.length >= 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [familyMemberId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl shadow-sm animate-pulse" />
          ))}
        </div>
        <div className="h-40 bg-white rounded-2xl shadow-sm animate-pulse" />
        <div className="h-64 bg-white rounded-2xl shadow-sm animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
        <p className="text-red-600 font-medium text-sm mb-3">{error}</p>
        <button
          type="button"
          onClick={() => load()}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium min-h-[44px]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const isEmpty = data.active_illnesses.length === 0 && data.stats.total_illnesses === 0;

  return (
    <div className="space-y-6">
      <QuickActions activeIllnesses={data.active_illnesses} />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <ActiveIllnessCards illnesses={data.active_illnesses} />
          <StatsSnapshot stats={data.stats} />
          <ActivityFeed events={data.recent_activity} hasMore={hasMoreActivity} />
        </>
      )}
    </div>
  );
}
