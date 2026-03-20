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

  if (!focus || loading || members.length === 0) return null;

  const selected = members.find((m) => m.id === focus.familyMemberId);

  return (
    <div className="flex items-center justify-end md:justify-start gap-2 w-full min-w-0">
      <label htmlFor="profile-switcher" className="sr-only">
        Show health for
      </label>

      <div className="relative flex flex-1 sm:flex-initial items-center gap-2 min-w-0 min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 pl-2 pr-9 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
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
          value={focus.familyMemberId ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            focus.setFamilyMemberId(v === '' ? null : v);
          }}
          className="flex-1 min-w-0 cursor-pointer appearance-none border-0 bg-transparent py-2 text-left text-[13px] font-semibold text-slate-800 outline-none focus:ring-0 truncate"
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
