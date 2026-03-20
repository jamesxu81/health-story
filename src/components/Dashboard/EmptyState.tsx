'use client';

import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="text-center py-14 px-6 bg-white rounded-2xl shadow-card border border-slate-200/60">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-green-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        Everyone&apos;s feeling good!
      </h2>
      <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
        No active sick days right now. When someone&apos;s under the weather, log it here.
      </p>
      <Link
        href="/record"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors min-h-[44px] shadow-sm"
      >
        + Record a sick day
      </Link>
    </div>
  );
}
