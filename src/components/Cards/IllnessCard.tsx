'use client';

import React from 'react';
import Link from 'next/link';
import { IllnessWithCounts } from '@/types/illness';

interface IllnessCardProps {
  illness: IllnessWithCounts;
}

export function IllnessCard({ illness }: IllnessCardProps) {
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
    <Link href={`/history/${illness.id}`} className="block hover:no-underline group">
      <article className="flex items-center gap-3.5 py-3.5 px-4 bg-white rounded-xl border border-black/10 transition-all group-hover:border-vital-teal-mid group-hover:shadow-[0_0_0_3px_var(--color-vital-teal-light)]">
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
  );
}
