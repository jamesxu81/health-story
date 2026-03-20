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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      </svg>
    ),
  },
  {
    href: '/record',
    label: 'Record',
    match: (p: string) => p === '/record',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'Timeline',
    match: (p: string) => p.startsWith('/history'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/family',
    label: 'Family',
    match: (p: string) => p.startsWith('/family'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
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
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            {/* Mobile: logo + profile switcher only (nav is in bottom tab bar) */}
            <div className="md:hidden flex items-center justify-between h-14">
              <Link href="/" className="text-lg font-bold tracking-tight text-indigo-600 shrink-0">
                Health Story
              </Link>
              <div className="min-w-0 max-w-[14rem] shrink-0">
                <ProfileSwitcher />
              </div>
            </div>

            {/* Desktop: logo | icon+label nav | profile */}
            <div className="hidden md:flex md:items-center md:justify-between md:gap-6 md:h-16">
              <Link
                href="/"
                className="text-xl font-bold tracking-tight text-indigo-600 shrink-0"
              >
                Health Story
              </Link>
              <nav
                className="flex items-center justify-center gap-1 min-w-0 flex-1 px-4"
                aria-label="Main navigation"
              >
                {navItems.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className={`[&_svg]:w-4 [&_svg]:h-4 ${active ? 'text-white' : 'text-slate-400'}`}>
                        {item.icon}
                      </span>
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

        <main className="pb-24 md:pb-8 max-w-5xl w-full mx-auto min-w-0">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav
          className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/60 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          aria-label="Tab navigation"
        >
          <div className="max-w-lg mx-auto grid grid-cols-4 h-16">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors active:opacity-80 ${
                    active
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors [&_svg]:w-5 [&_svg]:h-5 ${
                      active
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-400'
                    }`}
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
