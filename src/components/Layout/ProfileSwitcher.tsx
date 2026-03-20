'use client';

import { useEffect, useState } from 'react';
import { useFamilyFocus } from '@/context/FamilyFocusContext';
import { FamilyMember } from '@/types/family-member';
import { MemberAvatar } from '@/components/Family/MemberAvatar';

/**
 * Header profile switcher: filter dashboard & timeline by family member.
 * Avatar sits beside the native select (not overlaid) so labels never clash with the control text.
 */
export function ProfileSwitcher() {
  const focus = useFamilyFocus();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('auth_token') || 'default-user';
        const res = await fetch('/api/family-members', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setMembers(json.data || []);
        }
      } catch {
        /* optional */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Always show the control when inside the provider: empty DB (e.g. fresh Vercel)
  // still gets "Everyone"; hiding when members.length === 0 looked like a missing UI.
  if (!focus) return null;

  if (loading) {
    return (
      <div
        className="h-11 w-full min-w-[10rem] rounded-xl border border-slate-200 bg-slate-100 animate-pulse"
        aria-hidden
      />
    );
  }

  const selected = members.find((m) => m.id === focus.familyMemberId);

  return (
    <div className="w-full min-w-0">
      <label htmlFor="profile-switcher" className="sr-only">
        Show health for
      </label>

      <div className="relative flex w-full min-w-[10rem] items-center gap-2 min-h-[40px] rounded-lg border border-slate-200 bg-white pl-2 pr-9 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
        <span className="shrink-0 flex items-center justify-center" aria-hidden>
          {selected ? (
            <MemberAvatar name={selected.name} color={selected.color} size="sm" />
          ) : (
            <span className="w-7 h-7 rounded-full bg-slate-300/80 flex items-center justify-center text-[10px] font-bold text-slate-600">
              All
            </span>
          )}
        </span>

        <select
          id="profile-switcher"
          title={
            members.length === 0
              ? 'Add people under Family to filter by person'
              : undefined
          }
          value={focus.familyMemberId ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            focus.setFamilyMemberId(v === '' ? null : v);
          }}
          className="flex-1 min-w-0 cursor-pointer appearance-none border-0 bg-transparent py-2 text-left text-xs font-medium text-slate-700 outline-none focus:ring-0 truncate"
        >
          <option value="">Everyone</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <span
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] leading-none"
          aria-hidden
        >
          ▼
        </span>
      </div>
    </div>
  );
}
