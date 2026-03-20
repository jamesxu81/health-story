'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FamilyFocusProvider } from '@/context/FamilyFocusContext';
import { ProfileSwitcher } from '@/components/Layout/ProfileSwitcher';

const navItems = [
  {
    href: '/',
    label: 'Home',
    match: (p: string) => p === '/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    href: '/record',
    label: 'Record',
    match: (p: string) => p === '/record',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'Timeline',
    match: (p: string) => p.startsWith('/history'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/family',
    label: 'Family',
    match: (p: string) => p.startsWith('/family'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <FamilyFocusProvider>
      <div className="min-h-screen bg-[#f4f5f7]">
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          {/* Same max width as Home / Timeline / Family so nav sits above content, not at screen edge */}
          <div className="max-w-5xl mx-auto w-full px-3 xs:px-4 sm:px-6 lg:px-8 py-2 md:py-0 md:min-h-14 md:flex md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2">
            {/* Logo + profile — one cluster; nav follows on same row on md+ */}
            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start md:shrink-0">
              <Link href="/" className="text-lg sm:text-xl font-bold text-indigo-600 shrink-0">
                Health Story
              </Link>
              <div className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-[14rem] md:max-w-[13rem] lg:max-w-xs shrink">
                <ProfileSwitcher />
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 flex-wrap shrink-0">
              {navItems.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile: horizontal scroll links (always visible; bottom tabs are secondary) */}
            <nav
              className="flex md:hidden items-center gap-1.5 mt-2 -mx-1 px-1 overflow-x-auto overscroll-x-contain pb-1 touch-pan-x [scrollbar-width:thin]"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 bg-slate-100/80 active:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="pb-24 md:pb-0 max-w-app w-full mx-auto min-w-0">
          {children}
        </main>

        {/* Mobile bottom tab bar — above page content */}
        <nav
          className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          aria-label="Tab navigation"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-4 min-h-[3.75rem]">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 text-[10px] xs:text-[11px] font-semibold transition-colors py-2 ${
                    active
                      ? 'text-indigo-600 bg-indigo-50/90'
                      : 'text-slate-500 active:bg-slate-100'
                  }`}
                >
                  <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </FamilyFocusProvider>
  );
}
