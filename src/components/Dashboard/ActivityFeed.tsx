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
  illness_created: { dotColor: 'bg-red-400', verb: 'Logged' },
  illness_resolved: { dotColor: 'bg-green-400', verb: 'Resolved' },
  treatment_added: { dotColor: 'bg-violet-400', verb: 'Treated' },
} as const;

export function ActivityFeed({ events, hasMore }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <section aria-label="Recent activity">
        <h2 className="text-base font-semibold text-slate-800 mb-3">
          Recent activity
        </h2>
        <div className="p-8 text-center bg-white rounded-2xl shadow-sm">
          <p className="text-sm text-slate-400">
            All quiet lately — that&apos;s a good sign!
          </p>
          <Link
            href="/history"
            className="text-xs text-indigo-500 hover:underline mt-2 inline-block"
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
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {events.map((event, idx) => {
          const config = EVENT_CONFIG[event.type];
          const isLast = idx === events.length - 1;
          return (
            <Link
              key={`${event.type}-${event.illness_id}-${idx}`}
              href={`/history/${event.illness_id}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center pt-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor} flex-shrink-0`} />
                {!isLast && <span className="w-px flex-1 bg-slate-200 mt-1" />}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm text-slate-700 truncate">
                  <span className="font-medium">{config.verb}</span>{' '}
                  {event.type === 'treatment_added'
                    ? `"${event.title}" for ${event.illness_name}`
                    : event.title}
                </p>
              </div>

              <time className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 pt-0.5">
                {relativeTime(event.timestamp)}
              </time>
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <div className="text-center mt-3">
          <Link
            href="/history"
            className="text-xs text-indigo-500 hover:underline"
          >
            View all in timeline →
          </Link>
        </div>
      )}
    </section>
  );
}
