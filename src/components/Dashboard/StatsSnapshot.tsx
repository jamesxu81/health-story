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
  color: string;
  badgeClass: string;
  badgeText: string;
}

export function StatsSnapshot({ stats }: StatsSnapshotProps) {
  if (stats.total_illnesses === 0) return null;

  const tiles: StatTile[] = [
    {
      label: 'Total Recorded',
      value: String(stats.total_illnesses),
      color: 'text-vital-blue',
      badgeClass: 'bg-vital-blue-light text-vital-blue',
      badgeText: `${stats.resolved_count} resolved`,
    },
    {
      label: 'This Month',
      value: String(stats.this_month_count),
      color: 'text-vital-amber',
      badgeClass: 'bg-vital-amber-light text-vital-amber',
      badgeText: stats.this_month_count === 0 ? 'All clear' : `${stats.active_count} active`,
    },
  ];

  if (stats.avg_recovery_days !== null) {
    tiles.push({
      label: 'Avg. Recovery',
      value: `${stats.avg_recovery_days}`,
      color: 'text-vital-green',
      badgeClass: 'bg-vital-green-light text-vital-green',
      badgeText: `${stats.avg_recovery_days} days`,
    });
  }

  if (stats.most_common_illness) {
    tiles.push({
      label: 'Most Common',
      value: stats.most_common_illness.name,
      color: 'text-vital-coral',
      badgeClass: 'bg-vital-coral-light text-vital-coral',
      badgeText: `${stats.most_common_illness.count}× recorded`,
    });
  }

  return (
    <section aria-label="Health stats">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="bg-white rounded-[14px] border border-black/10 p-[18px]"
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.5px] text-vital-muted">
              {tile.label}
            </p>
            <p className={`font-display text-[28px] font-bold leading-none mt-1.5 ${tile.color}`}>
              {tile.value}
            </p>
            <div className="mt-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tile.badgeClass}`}>
                {tile.badgeText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
