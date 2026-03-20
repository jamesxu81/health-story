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

  const stripeClass = isActive
    ? 'bg-gradient-to-b from-rose-400 via-red-400 to-amber-400'
    : 'bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400';

  return (
    <Link href={`/history/${illness.id}`} className="block hover:no-underline">
      <article className="flex bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden min-h-touch-target border border-slate-100">
        <div className={`w-2 sm:w-2.5 flex-shrink-0 ${stripeClass}`} aria-hidden />
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-[15px] sm:text-base font-semibold text-slate-800 flex-1 leading-snug">
              {illness.name}
            </h3>
            <span
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isActive ? 'Active' : 'Resolved'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {illness.family_member_name && (
              <span
                className="inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full text-white"
                style={{ backgroundColor: illness.family_member_color || '#64748b' }}
              >
                {illness.family_member_name}
              </span>
            )}
            <p className="text-xs text-slate-400">{dateRange}</p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
            <span>{symptomCount} symptom{symptomCount !== 1 ? 's' : ''}</span>
            <span>{illness.treatment_count} treatment{illness.treatment_count !== 1 ? 's' : ''}</span>
            {illness.photo_count > 0 && (
              <span>{illness.photo_count} photo{illness.photo_count !== 1 ? 's' : ''}</span>
            )}
          </div>

          {illness.cause && (
            <p className="text-[11px] text-slate-400 mt-2 truncate">Maybe caused by: {illness.cause}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
