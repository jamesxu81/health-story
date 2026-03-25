'use client';

import { useState } from 'react';
import { IllnessList } from '@/components/Lists/IllnessList';
import { useFamilyFocus } from '@/context/FamilyFocusContext';

type TimelineTab = 'all' | 'active' | 'resolved';

/** Remounts list when profile focus or filter tab changes so pagination resets cleanly. */
export function TimelineListClient() {
  const focus = useFamilyFocus();
  const [tab, setTab] = useState<TimelineTab>('all');
  const keyBase = focus?.familyMemberId ?? 'everyone';
  const status: 'active' | 'resolved' | undefined = tab === 'all' ? undefined : tab;

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 mb-5"
        role="tablist"
        aria-label="Filter timeline"
      >
        {(
          [
            { id: 'all' as const, label: 'All Records' },
            { id: 'active' as const, label: 'Active' },
            { id: 'resolved' as const, label: 'Resolved' },
          ]
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors min-h-[36px] ${
              tab === id
                ? 'bg-vital-teal text-white border-vital-teal'
                : 'bg-white text-vital-muted border-black/10 hover:bg-vital-canvas'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <IllnessList key={`${keyBase}-${tab}`} status={status} />
    </div>
  );
}
