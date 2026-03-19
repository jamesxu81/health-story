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
    <Link href={`/history/${illness.id}`} className="block hover:no-underline">
      <article className="flex bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className={`w-1.5 flex-shrink-0 ${isActive ? 'bg-red-400' : 'bg-green-400'}`} />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-800 flex-1">{illness.name}</h3>
            <span
              className={`px-2 py-0.5 text-[11px] font-bold rounded-full whitespace-nowrap ${
                isActive
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isActive ? 'Active' : 'Resolved'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            {illness.family_member_name && (
              <span
                className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full text-white"
                style={{ backgroundColor: illness.family_member_color || '#64748b' }}
              >
                {illness.family_member_name}
              </span>
            )}
            <p className="text-xs text-slate-400">{dateRange}</p>
          </div>

          <div className="flex gap-3 text-[11px] text-slate-500">
            <span>{symptomCount} symptom{symptomCount !== 1 ? 's' : ''}</span>
            <span>{illness.treatment_count} treatment{illness.treatment_count !== 1 ? 's' : ''}</span>
            {illness.photo_count > 0 && (
              <span>{illness.photo_count} photo{illness.photo_count !== 1 ? 's' : ''}</span>
            )}
          </div>

          {illness.cause && (
            <p className="text-[11px] text-slate-400 mt-1.5 truncate">Maybe caused by: {illness.cause}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
