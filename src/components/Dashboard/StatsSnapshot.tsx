'use client';

export interface DashboardStats {
  total_illnesses: number;
  active_count: number;
  resolved_count: number;
  this_month_count: number;
  avg_recovery_days: number | null;
  most_common_illness: { name: string; count: number } | null;
}

interface StatsSnapshotProps {
  stats: DashboardStats;
}

interface StatTile {
  label: string;
  value: string;
  iconBg: string;
  icon: React.ReactNode;
}

export function StatsSnapshot({ stats }: StatsSnapshotProps) {
  if (stats.total_illnesses === 0) return null;

  const tiles: StatTile[] = [
    {
      label: 'Total recorded',
      value: String(stats.total_illnesses),
      iconBg: 'bg-blue-50 text-blue-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M18 18.75c-2.331 0-4.512-.645-6.374-1.766l-.001-.001a11.962 11.962 0 01-3.375-3.375A11.956 11.956 0 016.375 7.5H3.75A2.25 2.25 0 001.5 9.75v8.25a2.25 2.25 0 002.25 2.25h4.5" />
        </svg>
      ),
    },
    {
      label: 'This month',
      value: String(stats.this_month_count),
      iconBg: 'bg-amber-50 text-amber-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ];

  if (stats.avg_recovery_days !== null) {
    tiles.push({
      label: 'Avg. recovery',
      value: `${stats.avg_recovery_days}d`,
      iconBg: 'bg-green-50 text-green-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    });
  }

  if (stats.most_common_illness) {
    tiles.push({
      label: 'Most common',
      value: `${stats.most_common_illness.name}`,
      iconBg: 'bg-red-50 text-red-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    });
  }

  return (
    <section aria-label="Health stats">
      <h2 className="text-base font-semibold text-slate-800 mb-3">
        At a glance
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3"
          >
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tile.iconBg}`}>
              {tile.icon}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-800 leading-tight truncate">{tile.value}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{tile.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
