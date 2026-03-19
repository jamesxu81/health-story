'use client';

import Link from 'next/link';
import { IllnessWithCounts } from '@/types/illness';

interface QuickActionsProps {
  activeIllnesses: IllnessWithCounts[];
}

const baseTiles = [
  {
    href: '/record',
    label: 'Record sick day',
    color: 'bg-red-50 text-red-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'Timeline',
    color: 'bg-blue-50 text-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/family',
    label: 'Family',
    color: 'bg-violet-50 text-violet-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function QuickActions({ activeIllnesses }: QuickActionsProps) {
  const tiles = [...baseTiles];

  if (activeIllnesses.length > 0) {
    tiles.splice(1, 0, {
      href: `/history/${activeIllnesses[0].id}`,
      label: `Treat ${activeIllnesses[0].name}`,
      color: 'bg-amber-50 text-amber-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    });
  }

  return (
    <section aria-label="Quick actions">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href + tile.label}
            href={tile.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow min-h-[100px] justify-center"
          >
            <span className={`w-12 h-12 rounded-xl flex items-center justify-center ${tile.color}`}>
              {tile.icon}
            </span>
            <span className="text-xs font-medium text-slate-700 text-center leading-tight">
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
