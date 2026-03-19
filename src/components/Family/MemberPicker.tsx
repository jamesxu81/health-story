'use client';

import { useState, useEffect } from 'react';
import { FamilyMember } from '@/types/family-member';
import { MemberAvatar } from './MemberAvatar';

interface MemberPickerProps {
  value: string | null;
  onChange: (memberId: string | null) => void;
}

export function MemberPicker({ value, onChange }: MemberPickerProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const authToken = localStorage.getItem('auth_token') || 'default-user';
        const res = await fetch('/api/family-members', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const json = await res.json();
          setMembers(json.data || []);
        }
      } catch {
        // picker is optional
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (loading || members.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
      <label className="block text-[13px] font-semibold text-slate-600 mb-3">
        Who is this for?
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-[13px] font-semibold transition-all min-h-[44px] ${
            value === null
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-600'
          }`}
        >
          Everyone
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-[13px] font-semibold transition-all min-h-[44px] ${
              value === m.id
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-600'
            }`}
          >
            <MemberAvatar name={m.name} color={m.color} size="sm" />
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}
