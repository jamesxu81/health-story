'use client';

import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="text-center py-14 px-6 bg-white rounded-[14px] border border-black/10">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-vital-green-light flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-vital-green">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="font-display text-lg font-semibold text-vital-ink mb-2">
        Everyone&apos;s feeling good!
      </h2>
      <p className="text-sm text-vital-muted mb-6 max-w-xs mx-auto">
        No active sick days right now. When someone&apos;s under the weather, log it here.
      </p>
      <Link
        href="/record"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-vital-teal text-white text-[13px] font-medium rounded-lg hover:bg-vital-teal-hover transition-colors h-10"
      >
        + Record a sick day
      </Link>
    </div>
  );
}
