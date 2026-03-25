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
    dotClass: 'bg-vital-coral-light',
    emoji: '🤒',
    verb: 'Logged',
  },
  illness_resolved: {
    dotClass: 'bg-vital-green-light',
    emoji: '✓',
    verb: 'Resolved',
  },
  treatment_added: {
    dotClass: 'bg-vital-purple-light',
    emoji: '💊',
    verb: 'Treated',
  },
} as const;

export function ActivityFeed({ events, hasMore }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <section aria-label="Recent activity">
        <div className="bg-white rounded-[14px] border border-black/10 p-5">
          <h2 className="font-display text-[15px] font-semibold text-vital-ink mb-4">
            Health Timeline
          </h2>
          <div className="py-6 text-center">
            <p className="text-sm text-vital-muted">
              All quiet lately — that&apos;s a good sign!
            </p>
            <Link
              href="/history"
              className="text-[12px] text-vital-teal hover:underline mt-2 inline-block font-medium"
            >
              View full timeline
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Recent activity">
      <div className="bg-white rounded-[14px] border border-black/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[15px] font-semibold text-vital-ink">
            Health Timeline
          </h2>
          {hasMore && (
            <Link
              href="/history"
              className="text-[12px] font-medium text-vital-teal hover:underline"
            >
              View all &rarr;
            </Link>
          )}
        </div>
        <div>
          {events.map((event, idx) => {
            const config = EVENT_CONFIG[event.type];
            const isLast = idx === events.length - 1;
            return (
              <Link
                key={`${event.type}-${event.illness_id}-${idx}`}
                href={`/history/${event.illness_id}`}
                className={`flex gap-3.5 pb-5 relative group ${isLast ? 'pb-0' : ''}`}
              >
                {!isLast && (
                  <span
                    className="absolute left-[15px] top-[30px] bottom-0 w-px bg-black/10 pointer-events-none"
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-[1] w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 border-2 border-white text-[13px] ${config.dotClass}`}
                  aria-hidden
                >
                  {config.emoji}
                </span>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium text-vital-ink leading-snug truncate group-hover:text-vital-teal transition-colors">
                    <span className="font-semibold">{config.verb}</span>{' '}
                    {event.type === 'treatment_added'
                      ? `"${event.title}" for ${event.illness_name}`
                      : event.title}
                  </p>
                  <time className="text-[12px] text-vital-muted mt-0.5 block">
                    {relativeTime(event.timestamp)}
                  </time>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
