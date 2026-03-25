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
    iconBg: 'bg-vital-coral-light',
    primary: true,
  },
  {
    href: '/history',
    label: 'Timeline',
    emoji: '📅',
    iconBg: 'bg-vital-blue-light',
    primary: false,
  },
  {
    href: '/family',
    label: 'Family',
    emoji: '👨‍👩‍👧',
    iconBg: 'bg-vital-purple-light',
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
      iconBg: 'bg-vital-amber-light',
      primary: false,
    });
  }

  return (
    <section aria-label="Quick actions">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {tiles.map((tile) => (
          <Link
            key={tile.href + tile.label}
            href={tile.href}
            className={`group flex flex-col items-center gap-3 p-5 rounded-[14px] border transition-all min-h-[120px] justify-center active:scale-[0.98] ${
              tile.primary
                ? 'bg-vital-teal border-vital-teal text-white shadow-sm hover:bg-vital-teal-hover'
                : 'bg-white border-black/10 hover:border-vital-teal-mid hover:shadow-[0_0_0_3px_var(--color-vital-teal-light)]'
            }`}
          >
            <span
              className={`w-12 h-12 rounded-[10px] flex items-center justify-center text-2xl ${
                tile.primary ? 'bg-white/20' : tile.iconBg
              }`}
              aria-hidden
            >
              {tile.emoji}
            </span>
            <span className={`text-xs font-semibold text-center leading-tight ${
              tile.primary ? 'text-white/95' : 'text-vital-ink'
            }`}>
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
