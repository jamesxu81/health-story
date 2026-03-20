import { TimelineListClient } from '@/components/Lists/TimelineListClient';

export const metadata = {
  title: 'Timeline - Health Story',
  description: 'Look back on sick days, symptoms, and what you tried',
};

export default function HistoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Timeline</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6 sm:mb-8">
        Your family&apos;s health history at a glance.
      </p>
      <TimelineListClient />
    </div>
  );
}
