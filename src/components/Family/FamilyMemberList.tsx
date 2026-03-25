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
          <div key={i} className="h-20 bg-white rounded-[14px] border border-black/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-white rounded-[14px] border border-black/10">
        <p className="text-sm text-vital-red">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.length === 0 && !showForm && (
        <div className="text-center py-12 px-6 bg-white rounded-[14px] border border-black/10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-vital-purple-light flex items-center justify-center text-2xl">
            👨‍👩‍👧
          </div>
          <h2 className="font-display text-lg font-semibold text-vital-ink mb-1">No family members yet</h2>
          <p className="text-sm text-vital-muted mb-6 max-w-xs mx-auto">
            Add your family members so you can track who&apos;s feeling under the weather.
          </p>
        </div>
      )}

      {members.length > 0 && (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3.5 p-4 sm:p-5 bg-white rounded-[14px] border border-black/10"
            >
              <MemberAvatar name={m.name} color={m.color} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-vital-ink">{m.name}</p>
                {m.relationship && (
                  <p className="text-[12px] text-vital-muted capitalize mt-0.5">{m.relationship}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditing(m);
                    setShowForm(true);
                  }}
                  className="px-3 py-2 text-[12px] font-medium text-vital-teal hover:bg-vital-teal-light rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="px-3 py-2 text-[12px] font-medium text-vital-red hover:bg-vital-red-light rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
          <h3 className="font-display text-[15px] font-semibold text-vital-ink mb-4">
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
          className="w-full py-3.5 border-2 border-dashed border-black/15 hover:border-vital-teal text-vital-muted hover:text-vital-teal font-medium rounded-[14px] transition-colors h-14 text-[13px] bg-white"
        >
          + Add a family member
        </button>
      )}
    </div>
  );
}
