'use client';

import Link from 'next/link';
import { IllnessWithCounts } from '@/types/illness';

interface ActiveIllnessCardsProps {
  illnesses: IllnessWithCounts[];
}

function daysElapsed(dateStarted: Date | string): number {
  const start = new Date(dateStarted);
  const now = new Date();
  return Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function ActiveIllnessCards({ illnesses }: ActiveIllnessCardsProps) {
  if (illnesses.length === 0) return null;

  const shown = illnesses.slice(0, 10);
  const overflow = illnesses.length - shown.length;

  return (
    <section aria-label="Active sick days">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">
        {illnesses.length} active sick day
        {illnesses.length !== 1 ? 's' : ''}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {shown.map((illness) => {
          const days = daysElapsed(illness.date_started);
          const symptomCount = illness.symptoms?.length ?? 0;
          const isLingering = days > 7;

          return (
            <Link
              key={illness.id}
              href={`/history/${illness.id}`}
              className="block hover:no-underline group"
            >
              <article className="bg-white rounded-2xl shadow-card group-hover:shadow-card-hover transition-all overflow-hidden border border-slate-200/60 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 flex-1 truncate">
                    {illness.name}
                  </h3>
                  <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${
                    isLingering
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    Day {days + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                  {illness.family_member_name && (
                    <span
                      className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full text-white"
                      style={{ backgroundColor: illness.family_member_color || '#64748b' }}
                    >
                      {illness.family_member_name}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Started{' '}
                    {new Date(illness.date_started).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-3 text-xs text-slate-500">
                  <span>{symptomCount} symptom{symptomCount !== 1 ? 's' : ''}</span>
                  <span>{illness.treatment_count} treatment{illness.treatment_count !== 1 ? 's' : ''}</span>
                </div>

                {isLingering && (
                  <p className="mt-2.5 text-xs text-amber-600 font-medium">
                    Still going? You can mark it resolved
                  </p>
                )}
              </article>
            </Link>
          );
        })}
      </div>

      {overflow > 0 && (
        <p className="text-xs text-slate-400 mt-4 text-center">
          and {overflow} more&hellip;{' '}
          <Link href="/history?status=active" className="text-indigo-600 font-medium hover:underline">
            View all
          </Link>
        </p>
      )}
    </section>
  );
}
