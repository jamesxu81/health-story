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

  return (
    <Link href={`/history/${illness.id}`} className="block hover:no-underline group">
      <article className="bg-white rounded-2xl shadow-card group-hover:shadow-card-hover transition-all border border-slate-200/60 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-900 flex-1 leading-snug truncate">
            {illness.name}
          </h3>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className={`w-2 h-2 rounded-full ${
              isActive ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'
            }`} />
            <span className={`text-xs font-medium ${
              isActive ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {isActive ? 'Active' : 'Resolved'}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2.5">
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

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>{symptomCount} symptom{symptomCount !== 1 ? 's' : ''}</span>
          <span>{illness.treatment_count} treatment{illness.treatment_count !== 1 ? 's' : ''}</span>
          {illness.photo_count > 0 && (
            <span>{illness.photo_count} photo{illness.photo_count !== 1 ? 's' : ''}</span>
          )}
        </div>

        {illness.cause && (
          <p className="text-xs text-slate-400 mt-2 truncate">Maybe caused by: {illness.cause}</p>
        )}
      </article>
    </Link>
  );
}
