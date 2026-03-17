'use client';

/**
 * IllnessCard Component
 * Displays a single illness record in list view
 * Shows name, date range, symptom count, treatment count
 */

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
    <Link
      href={`/history/${illness.id}`}
      className="block hover:no-underline"
    >
      <article className="p-4 bg-white rounded-lg border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer min-h-[120px] flex flex-col justify-between">
          {/* Header with status badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 flex-1">{illness.name}</h3>
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                isActive
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isActive ? 'Active' : 'Resolved'}
            </span>
          </div>

          {/* Date range */}
          <p className="text-sm text-slate-600 mb-3">{dateRange}</p>

          {/* Symptoms and treatments count */}
          <div className="flex gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 bg-blue-100 text-blue-700 rounded text-center leading-4">
                ◆
              </span>
              <span>
                {symptomCount} symptom{symptomCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 bg-purple-100 text-purple-700 rounded text-center leading-4">
                ◆
              </span>
              <span>
                {illness.treatment_count} treatment{illness.treatment_count !== 1 ? 's' : ''}
              </span>
            </div>
            {illness.photo_count > 0 && (
              <div className="flex items-center gap-1">
                <span className="inline-block w-4 h-4 bg-pink-100 text-pink-700 rounded text-center leading-4">
                  ◆
                </span>
                <span>
                  {illness.photo_count} photo{illness.photo_count !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Optional cause preview */}
          {illness.cause && (
            <p className="text-xs text-slate-500 mt-2 truncate">Cause: {illness.cause}</p>
          )}
        </article>
    </Link>
  );
}
