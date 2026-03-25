'use client';

import { useEffect, useState } from 'react';
import { useFamilyFocus } from '@/context/FamilyFocusContext';
import { FamilyMember } from '@/types/family-member';
import { MemberAvatar } from '@/components/Family/MemberAvatar';

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

  if (!focus) return null;

  if (loading) {
    return (
      <div
        className="h-10 w-full min-w-[10rem] rounded-[10px] border border-black/10 bg-vital-canvas animate-pulse"
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

      <div className="relative flex w-full min-w-[10rem] items-center gap-2 min-h-[40px] rounded-[10px] border border-black/10 bg-white pl-2 pr-9 focus-within:ring-2 focus-within:ring-vital-teal/25 focus-within:border-vital-teal">
        <span className="shrink-0 flex items-center justify-center" aria-hidden>
          {selected ? (
            <MemberAvatar name={selected.name} color={selected.color} size="sm" />
          ) : (
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-vital-purple to-vital-teal flex items-center justify-center text-[10px] font-bold text-white">
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
          className="flex-1 min-w-0 cursor-pointer appearance-none border-0 bg-transparent py-2 text-left text-[12px] font-medium text-vital-ink outline-none focus:ring-0 truncate"
        >
          <option value="">Everyone</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <span
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-vital-muted text-[10px] leading-none"
          aria-hidden
        >
          ▼
        </span>
      </div>
    </div>
  );
}
