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
      <div className="bg-white rounded-[14px] border border-black/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[15px] font-semibold text-vital-ink">
            {illnesses.length} active sick day
            {illnesses.length !== 1 ? 's' : ''}
          </h2>
          <Link href="/history?status=active" className="text-[12px] font-medium text-vital-teal hover:underline">
            View all &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {shown.map((illness) => {
            const days = daysElapsed(illness.date_started);
            const symptomCount = illness.symptoms?.length ?? 0;
            const isLingering = days > 7;

            return (
              <Link
                key={illness.id}
                href={`/history/${illness.id}`}
                className="flex items-center gap-3.5 p-3 rounded-xl border border-black/10 hover:border-vital-teal-mid hover:shadow-[0_0_0_3px_var(--color-vital-teal-light)] transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0 ${
                    isLingering ? 'bg-vital-red-light' : 'bg-vital-amber-light'
                  }`}
                  aria-hidden
                >
                  🤒
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-vital-ink truncate group-hover:text-vital-teal transition-colors">
                    {illness.name}
                  </p>
                  <p className="text-[12px] text-vital-muted mt-0.5">
                    {illness.family_member_name && (
                      <span className="font-medium text-vital-ink">{illness.family_member_name} · </span>
                    )}
                    {symptomCount} symptom{symptomCount !== 1 ? 's' : ''} · {illness.treatment_count} treatment{illness.treatment_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    isLingering
                      ? 'bg-vital-red-light text-vital-red'
                      : 'bg-vital-amber-light text-vital-amber'
                  }`}>
                    Day {days + 1}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {overflow > 0 && (
          <p className="text-xs text-vital-muted mt-3 text-center">
            and {overflow} more&hellip;{' '}
            <Link href="/history" className="text-vital-teal font-medium hover:underline">
              View all
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
