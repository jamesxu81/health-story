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
    emoji: '📝',
    color: 'from-rose-100 to-red-100 ring-1 ring-red-200/80',
  },
  {
    href: '/history',
    label: 'Timeline',
    emoji: '📅',
    color: 'from-sky-100 to-blue-100 ring-1 ring-blue-200/80',
  },
  {
    href: '/family',
    label: 'Family',
    emoji: '👨‍👩‍👧',
    color: 'from-violet-100 to-purple-100 ring-1 ring-violet-200/80',
  },
];

export function QuickActions({ activeIllnesses }: QuickActionsProps) {
  const tiles = [...baseTiles];

  if (activeIllnesses.length > 0) {
    tiles.splice(1, 0, {
      href: `/history/${activeIllnesses[0].id}`,
      label: `Treat ${activeIllnesses[0].name}`,
      emoji: '💊',
      color: 'from-amber-100 to-orange-100 ring-1 ring-amber-200/80',
    });
  }

  return (
    <section aria-label="Quick actions">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map((tile) => (
          <Link
            key={tile.href + tile.label}
            href={tile.href}
            className="flex flex-col items-center gap-2 p-4 sm:p-5 bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all min-h-[108px] sm:min-h-[116px] justify-center border border-slate-100"
          >
            <span
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-[1.65rem] leading-none shadow-inner ${tile.color}`}
              aria-hidden
            >
              {tile.emoji}
            </span>
            <span className="text-[11px] xs:text-xs font-semibold text-slate-700 text-center leading-tight px-0.5">
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
