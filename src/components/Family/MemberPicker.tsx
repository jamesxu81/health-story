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
    <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
      <label className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-3">
        Who is this for?
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-[12px] font-semibold transition-all h-9 ${
            value === null
              ? 'border-vital-teal bg-vital-teal-light text-vital-teal'
              : 'border-black/10 bg-white text-vital-muted hover:border-black/20 hover:text-vital-ink'
          }`}
        >
          Everyone
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-[12px] font-semibold transition-all h-9 ${
              value === m.id
                ? 'border-vital-teal bg-vital-teal-light text-vital-teal'
                : 'border-black/10 bg-white text-vital-muted hover:border-black/20 hover:text-vital-ink'
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
