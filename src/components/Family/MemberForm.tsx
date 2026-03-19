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
    'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white';

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
        <div className="p-4 bg-red-50 rounded-2xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="member-name" className="block text-sm font-medium text-slate-700 mb-1.5">
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
        <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
        <div className="flex gap-2.5 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full border-2 transition-all min-w-[44px] min-h-[44px] ${
                color === c ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="member-relationship" className="block text-sm font-medium text-slate-700 mb-1.5">
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
        <label htmlFor="member-dob" className="block text-sm font-medium text-slate-700 mb-1.5">
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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors min-h-[44px]"
        >
          {loading ? 'Saving...' : member ? 'Update' : 'Add member'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
