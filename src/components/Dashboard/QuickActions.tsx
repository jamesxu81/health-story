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
    iconBg: 'bg-rose-50',
    primary: true,
  },
  {
    href: '/history',
    label: 'Timeline',
    emoji: '📅',
    iconBg: 'bg-sky-50',
    primary: false,
  },
  {
    href: '/family',
    label: 'Family',
    emoji: '👨‍👩‍👧',
    iconBg: 'bg-violet-50',
    primary: false,
  },
];

export function QuickActions({ activeIllnesses }: QuickActionsProps) {
  const tiles = [...baseTiles];

  if (activeIllnesses.length > 0) {
    tiles.splice(1, 0, {
      href: `/history/${activeIllnesses[0].id}`,
      label: `Treat ${activeIllnesses[0].name}`,
      emoji: '💊',
      iconBg: 'bg-amber-50',
      primary: false,
    });
  }

  return (
    <section aria-label="Quick actions">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href + tile.label}
            href={tile.href}
            className={`group flex flex-col items-center gap-3 p-5 rounded-2xl shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all min-h-[120px] justify-center border ${
              tile.primary
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-200/60'
            }`}
          >
            <span
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                tile.primary ? 'bg-white/20' : tile.iconBg
              }`}
              aria-hidden
            >
              {tile.emoji}
            </span>
            <span className={`text-xs font-semibold text-center leading-tight ${
              tile.primary ? 'text-white/90' : 'text-slate-700'
            }`}>
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
