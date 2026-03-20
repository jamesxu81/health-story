'use client';

import Link from 'next/link';

export interface ActivityEvent {
  type: 'illness_created' | 'illness_resolved' | 'treatment_added';
  title: string;
  illness_id: string;
  illness_name: string;
  timestamp: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  hasMore: boolean;
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const EVENT_CONFIG = {
  illness_created: {
    dotColor: 'bg-rose-500',
    stripe: 'border-l-rose-400',
    verb: 'Logged',
  },
  illness_resolved: {
    dotColor: 'bg-emerald-500',
    stripe: 'border-l-emerald-400',
    verb: 'Resolved',
  },
  treatment_added: {
    dotColor: 'bg-violet-500',
    stripe: 'border-l-violet-400',
    verb: 'Treated',
  },
} as const;

export function ActivityFeed({ events, hasMore }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <section aria-label="Recent activity">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Recent activity
        </h2>
        <div className="p-8 text-center bg-white rounded-2xl shadow-card border border-slate-200/60">
          <p className="text-sm text-slate-400">
            All quiet lately — that&apos;s a good sign!
          </p>
          <Link
            href="/history"
            className="text-sm text-indigo-600 hover:underline mt-3 inline-block font-medium"
          >
            View full timeline
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Recent activity">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">
        Recent activity
      </h2>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-200/60">
        {events.map((event, idx) => {
          const config = EVENT_CONFIG[event.type];
          const isLast = idx === events.length - 1;
          return (
            <Link
              key={`${event.type}-${event.illness_id}-${idx}`}
              href={`/history/${event.illness_id}`}
              className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50 transition-colors ${
                !isLast ? 'border-b border-slate-100' : ''
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor} shrink-0`} />

              <p className="text-sm text-slate-700 leading-snug flex-1 min-w-0 truncate">
                <span className="font-semibold text-slate-900">{config.verb}</span>{' '}
                {event.type === 'treatment_added'
                  ? `"${event.title}" for ${event.illness_name}`
                  : event.title}
              </p>

              <time className="text-xs text-slate-400 whitespace-nowrap shrink-0 font-medium">
                {relativeTime(event.timestamp)}
              </time>
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <div className="text-center mt-4">
          <Link
            href="/history"
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            View all in timeline &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
