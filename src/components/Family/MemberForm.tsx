'use client';

import { useState, useCallback } from 'react';
import { FamilyMember } from '@/types/family-member';

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#2563eb', // blue
  '#0d9488', // teal
  '#16a34a', // green
  '#ca8a04', // yellow
  '#ea580c', // orange
  '#db2777', // pink
  '#7c3aed', // purple
];

interface MemberFormProps {
  member?: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
  onCancel: () => void;
}

export function MemberForm({ member, onSave, onCancel }: MemberFormProps) {
  const [name, setName] = useState(member?.name || '');
  const [color, setColor] = useState(member?.color || PRESET_COLORS[0]);
  const [relationship, setRelationship] = useState(member?.relationship || '');
  const [dateOfBirth, setDateOfBirth] = useState(member?.date_of_birth || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClasses =
    'w-full px-4 py-3 border border-black/10 rounded-[10px] text-sm focus:ring-2 focus:ring-vital-teal/20 focus:border-vital-teal bg-white text-vital-ink transition-colors';

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const authToken = localStorage.getItem('auth_token') || 'default-user';
        const payload = {
          name: name.trim(),
          color,
          relationship: relationship.trim() || null,
          date_of_birth: dateOfBirth || null,
        };

        const url = member ? `/api/family-members/${member.id}` : '/api/family-members';
        const method = member ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to save');
        }

        const json = await res.json();
        onSave(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [name, color, relationship, dateOfBirth, member, onSave]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-vital-red-light rounded-[14px] border border-vital-red/20">
          <p className="text-sm text-vital-red">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="member-name" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
          Name *
        </label>
        <input
          id="member-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Emma, Dad, Baby Leo"
          className={inputClasses}
          maxLength={255}
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-2">Color</label>
        <div className="flex gap-2.5 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                color === c ? 'border-vital-ink scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="member-relationship" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
          Relationship
        </label>
        <select
          id="member-relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className={inputClasses}
        >
          <option value="">Select...</option>
          <option value="self">Myself</option>
          <option value="child">Child</option>
          <option value="spouse">Spouse / Partner</option>
          <option value="parent">Parent</option>
          <option value="sibling">Sibling</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="member-dob" className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-1.5">
          Date of birth (optional)
        </label>
        <input
          id="member-dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="py-3 bg-vital-teal hover:bg-vital-teal-hover disabled:bg-black/10 disabled:text-vital-muted-2 text-white text-[13px] font-medium rounded-lg transition-colors h-12 min-w-0"
        >
          {loading ? 'Saving...' : member ? 'Update' : 'Add member'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-black/10 text-vital-ink text-[13px] font-medium rounded-lg bg-white hover:bg-vital-canvas transition-colors h-12"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
