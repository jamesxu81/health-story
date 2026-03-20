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
        <h2 className="text-base font-semibold text-slate-800 mb-3">
          Recent activity
        </h2>
        <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-400">
            All quiet lately — that&apos;s a good sign!
          </p>
          <Link
            href="/history"
            className="text-xs text-indigo-500 hover:underline mt-2 inline-block font-medium"
          >
            View full timeline
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Recent activity">
      <h2 className="text-base font-semibold text-slate-800 mb-3">
        Recent activity
      </h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        {events.map((event, idx) => {
          const config = EVENT_CONFIG[event.type];
          const isLast = idx === events.length - 1;
          return (
            <Link
              key={`${event.type}-${event.illness_id}-${idx}`}
              href={`/history/${event.illness_id}`}
              className={`flex items-stretch border-l-4 ${config.stripe} pl-3 pr-3 sm:pl-4 hover:bg-slate-50/90 transition-colors`}
            >
              <div className="flex items-start gap-3 py-3.5 flex-1 min-w-0">
                <div className="flex flex-col items-center pt-1.5 shrink-0">
                  <span className={`w-3 h-3 rounded-full ${config.dotColor} ring-2 ring-white shadow-sm`} />
                  {!isLast && <span className="w-0.5 flex-1 min-h-[12px] bg-slate-200 mt-1 rounded-full" />}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-slate-700 leading-snug">
                    <span className="font-semibold text-slate-800">{config.verb}</span>{' '}
                    {event.type === 'treatment_added'
                      ? `"${event.title}" for ${event.illness_name}`
                      : event.title}
                  </p>
                </div>

                <time className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 pt-1 font-medium">
                  {relativeTime(event.timestamp)}
                </time>
              </div>
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <div className="text-center mt-3">
          <Link
            href="/history"
            className="text-xs text-indigo-500 hover:underline font-semibold"
          >
            View all in timeline →
          </Link>
        </div>
      )}
    </section>
  );
}
