'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IllnessWithCounts } from '@/types/illness';

function timelineAuthHeaders(): HeadersInit {
  const t =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token') || 'default-user'
      : 'default-user';
  return { Authorization: `Bearer ${t}` };
}

function TimelineRecordDeleteButton({
  illnessId,
  illnessName,
  onDeleted,
}: {
  illnessId: string;
  illnessName: string;
  onDeleted: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const doDelete = async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/illnesses/${illnessId}`, {
        method: 'DELETE',
        headers: timelineAuthHeaders(),
      });
      if (!r.ok) {
        let msg = 'Could not remove record';
        try {
          const j = await r.json();
          if (j?.error) msg = typeof j.error === 'string' ? j.error : msg;
        } catch {
          /* ignore */
        }
        window.alert(msg);
        return;
      }
      setConfirmOpen(false);
      onDeleted();
    } finally {
      setBusy(false);
    }
  };

  if (confirmOpen) {
    return (
      <div
        className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5 rounded-[10px] border border-black/10 bg-white p-2 shadow-md max-w-[11rem]"
        role="group"
        aria-label="Confirm remove record"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] text-vital-muted text-right leading-snug">
          Remove &ldquo;{illnessName}&rdquo; from the timeline?
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={busy}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-black/10 bg-white text-vital-ink hover:bg-vital-canvas"
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-vital-red text-white hover:opacity-90 disabled:opacity-50"
            onClick={() => void doDelete()}
          >
            {busy ? '…' : 'Remove'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/95 text-vital-muted shadow-sm hover:bg-vital-red-light hover:text-vital-red hover:border-vital-red/20 transition-colors disabled:opacity-50"
      aria-label={`Remove ${illnessName} from timeline`}
      title="Remove from timeline"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmOpen(true);
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

interface IllnessCardProps {
  illness: IllnessWithCounts;
  /** When set, shows remove control and refetches list after successful DELETE. */
  onRecordDeleted?: () => void;
}

export function IllnessCard({ illness, onRecordDeleted }: IllnessCardProps) {
  const isActive = illness.status === 'active';
  const dateRange = illness.date_ended
    ? `${new Date(illness.date_started).toLocaleDateString()} - ${new Date(illness.date_ended).toLocaleDateString()}`
    : `Started ${new Date(illness.date_started).toLocaleDateString()}`;

  const symptomCount = illness.symptoms?.length || 0;
  const dateShort = new Date(illness.date_started).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative">
      <Link href={`/history/${illness.id}`} className="block hover:no-underline group">
        <article
          className={`flex items-center gap-3.5 py-3.5 px-4 bg-white rounded-xl border border-black/10 transition-all group-hover:border-vital-teal-mid group-hover:shadow-[0_0_0_3px_var(--color-vital-teal-light)] ${
            onRecordDeleted ? 'pr-12 sm:pr-14' : ''
          }`}
        >
        <div
          className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0 ${
            isActive ? 'bg-vital-coral-light' : 'bg-vital-green-light'
          }`}
          aria-hidden
        >
          {isActive ? '🤒' : '✓'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-vital-ink leading-snug truncate">
            {illness.name}
          </h3>
          <p className="text-[12px] text-vital-muted mt-0.5 line-clamp-3">
            {illness.family_member_name && (
              <span className="font-medium text-vital-ink">{illness.family_member_name} · </span>
            )}
            {dateRange}
            {symptomCount > 0 && (
              <span>{` · ${symptomCount} symptom${symptomCount !== 1 ? 's' : ''}`}</span>
            )}
            {illness.treatment_count > 0 && (
              <span>{` · ${illness.treatment_count} treatment${illness.treatment_count !== 1 ? 's' : ''}`}</span>
            )}
            {illness.photo_count > 0 && (
              <span>{` · ${illness.photo_count} photo${illness.photo_count !== 1 ? 's' : ''}`}</span>
            )}
            {illness.cause && (
              <>
                <br />
                <span className="text-vital-muted-2">{`Maybe caused by: ${illness.cause}`}</span>
              </>
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[12px] text-vital-muted">{dateShort}</p>
          <span
            className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              isActive ? 'bg-vital-red-light text-vital-red' : 'bg-vital-green-light text-vital-green'
            }`}
          >
            {isActive ? 'Active' : 'Resolved'}
          </span>
        </div>
      </article>
    </Link>
      {onRecordDeleted && (
        <TimelineRecordDeleteButton
          illnessId={illness.id}
          illnessName={illness.name}
          onDeleted={onRecordDeleted}
        />
      )}
    </div>
  );
}
