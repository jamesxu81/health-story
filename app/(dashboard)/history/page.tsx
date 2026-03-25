import { TimelineListClient } from '@/components/Lists/TimelineListClient';

export const metadata = {
  title: 'Timeline - Health Story',
  description: 'Look back on sick days, symptoms, and what you tried',
};

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold text-vital-ink">Timeline</h1>
        <p className="text-sm text-vital-muted mt-1">
          Your family&apos;s health history at a glance.
        </p>
      </div>
      <TimelineListClient />
    </div>
  );
}
