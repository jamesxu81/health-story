'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FamilyFocusProvider } from '@/context/FamilyFocusContext';
import { ProfileSwitcher } from '@/components/Layout/ProfileSwitcher';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    match: (p: string) => p === '/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] shrink-0" aria-hidden>
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    href: '/record',
    label: 'Record',
    match: (p: string) => p === '/record',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] shrink-0" aria-hidden>
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'Timeline',
    match: (p: string) => p.startsWith('/history'),
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] shrink-0" aria-hidden>
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
      </svg>
    ),
  },
  {
    href: '/family',
    label: 'Family',
    match: (p: string) => p.startsWith('/family'),
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] shrink-0" aria-hidden>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
];

function NavLinks({
  pathname,
  className,
}: {
  pathname: string;
  className?: string;
}) {
  return (
    <nav className={className} aria-label="Main navigation">
      {navItems.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-2.5 py-2.5 px-5 text-sm font-medium transition-colors ${
              active
                ? 'bg-vital-teal-light text-vital-teal before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-vital-teal before:rounded-r-sm'
                : 'text-vital-muted hover:bg-vital-canvas hover:text-vital-ink'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <FamilyFocusProvider>
      <div className="flex min-h-[100dvh] bg-vital-canvas text-vital-ink">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-[220px] shrink-0 flex-col sticky top-0 h-[100dvh] bg-white border-r border-black/10 pt-6 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-5 pb-6 mb-3 border-b border-black/10"
          >
            <div className="w-[34px] h-[34px] rounded-[10px] bg-vital-teal flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white" aria-hidden>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2v-4h2v4zm0-6h-2V8h2v2z" />
              </svg>
            </div>
            <span className="font-display font-bold text-base text-vital-ink leading-tight">
              Health<span className="text-vital-teal">Story</span>
            </span>
          </Link>

          <NavLinks pathname={pathname} className="flex flex-col gap-1 flex-1 min-h-0" />

          <div className="mt-auto pt-4 px-5 border-t border-black/10">
            <ProfileSwitcher />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Mobile top bar */}
          <header className="md:hidden sticky top-0 z-40 bg-white border-b border-black/10">
            <div className="flex items-center justify-between gap-3 h-14 px-4">
              <Link href="/" className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-[10px] bg-vital-teal flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2v-4h2v4zm0-6h-2V8h2v2z" />
                  </svg>
                </div>
                <span className="font-display font-bold text-[15px] text-vital-ink truncate">
                  Health<span className="text-vital-teal">Story</span>
                </span>
              </Link>
              <div className="min-w-0 max-w-[14rem] shrink-0">
                <ProfileSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-8 pt-7 px-4 md:px-7">
            {children}
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        <nav
          className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-black/10 md:hidden"
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
                    active ? 'text-vital-teal' : 'text-vital-muted'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-[10px] transition-colors [&_svg]:w-[18px] [&_svg]:h-[18px] ${
                      active ? 'bg-vital-teal-light text-vital-teal' : 'text-vital-muted'
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
