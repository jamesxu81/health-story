'use client';

import { useState, useEffect, useCallback } from 'react';
import { FamilyMember } from '@/types/family-member';
import { MemberAvatar } from './MemberAvatar';
import { MemberForm } from './MemberForm';

export function FamilyMemberList() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('auth_token') || 'default-user';
      const res = await fetch('/api/family-members', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Failed to load family members');
      const json = await res.json();
      setMembers(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Remove this family member? Their illness records will be kept but unassigned.')) return;
    try {
      const authToken = localStorage.getItem('auth_token') || 'default-user';
      const res = await fetch(`/api/family-members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }, []);

  const handleSave = useCallback(
    (saved: FamilyMember) => {
      if (editing) {
        setMembers((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
      } else {
        setMembers((prev) => [...prev, saved]);
      }
      setShowForm(false);
      setEditing(null);
    },
    [editing]
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-white rounded-2xl shadow-sm animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-white rounded-2xl shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.length === 0 && !showForm && (
        <div className="text-center py-12 px-6 bg-white rounded-2xl shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-violet-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">No family members yet</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
            Add your family members so you can track who&apos;s feeling under the weather.
          </p>
        </div>
      )}

      {members.length > 0 && (
        <div className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm"
            >
              <MemberAvatar name={m.name} color={m.color} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{m.name}</p>
                {m.relationship && (
                  <p className="text-xs text-slate-400 capitalize">{m.relationship}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditing(m);
                    setShowForm(true);
                  }}
                  className="px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors min-h-[44px]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">
            {editing ? `Edit ${editing.name}` : 'Add a family member'}
          </h3>
          <MemberForm
            member={editing}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors min-h-[44px]"
        >
          + Add a family member
        </button>
      )}
    </div>
  );
}
