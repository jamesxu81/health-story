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
          <div className="max-w-5xl mx-auto w-full px-3 xs:px-4 sm:px-6 lg:px-8 py-2">
            {/* Mobile / tablet: logo + switcher on one row; scroll nav below */}
            <div className="md:hidden">
              <div className="flex w-full items-center justify-between gap-3">
                <Link href="/" className="text-lg sm:text-xl font-bold text-indigo-600 shrink-0 min-w-0">
                  Health Story
                </Link>
                <div className="min-w-0 flex-1 flex justify-end max-w-[min(100%,15rem)] sm:max-w-[16rem] shrink-0 basis-auto">
                  <ProfileSwitcher />
                </div>
              </div>
              <nav
                className="flex items-stretch gap-2 sm:gap-2.5 mt-3 -mx-1 px-1 pb-1 overflow-x-auto overscroll-x-contain snap-x snap-mandatory touch-pan-x [scrollbar-width:thin] scroll-px-2"
                aria-label="Main navigation"
              >
                {navItems.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`snap-start shrink-0 min-h-touch-target inline-flex items-center justify-center px-4 sm:px-5 rounded-xl text-base sm:text-[17px] font-semibold leading-none transition-colors active:scale-[0.98] ${
                        active
                          ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-200/80'
                          : 'text-slate-700 bg-slate-100/90 active:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Desktop: logo | centered nav | profile — avoids switcher collapsing (min-w-0 shrink) next to logo */}
            <div className="hidden md:flex md:items-center md:justify-between md:gap-4 md:min-h-14 md:py-1">
              <Link
                href="/"
                className="text-xl font-bold text-indigo-600 shrink-0"
              >
                Health Story
              </Link>
              <nav
                className="flex items-center justify-center gap-1.5 lg:gap-2 flex-wrap min-w-0 flex-1 px-2"
                aria-label="Main navigation"
              >
                {navItems.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`min-h-touch-target inline-flex items-center px-4 py-2.5 rounded-xl text-base font-semibold transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-200/70'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="shrink-0 w-[min(100%,16rem)] min-w-[11rem] max-w-[18rem]">
                <ProfileSwitcher />
              </div>
            </div>
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
          <div className="max-w-5xl mx-auto grid grid-cols-4 min-h-[3.85rem] xs:min-h-16">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 px-1 text-xs xs:text-[13px] font-semibold transition-colors py-2 active:opacity-90 ${
                    active
                      ? 'text-indigo-700 bg-indigo-50/90'
                      : 'text-slate-600 active:bg-slate-100'
                  }`}
                >
                  <span
                    className={`[&_svg]:w-7 [&_svg]:h-7 ${active ? 'text-indigo-600' : 'text-slate-400'}`}
                  >
                    {item.icon}
                  </span>
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
