'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isRecordPage = pathname === '/record';
  const isHistoryPage = pathname === '/history';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-cyan-600">
              Health Story
            </Link>
            <div className="flex gap-4">
              <Link
                href="/record"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isRecordPage
                    ? 'bg-cyan-100 text-cyan-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Record New
              </Link>
              <Link
                href="/history"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isHistoryPage
                    ? 'bg-cyan-100 text-cyan-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                History
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}
