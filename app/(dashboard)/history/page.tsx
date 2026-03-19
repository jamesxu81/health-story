import { IllnessList } from '@/components/Lists/IllnessList';

export const metadata = {
  title: 'Timeline - Health Story',
  description: 'Look back on sick days, symptoms, and what you tried',
};

export default function HistoryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-1.5">Timeline</h1>
      <p className="text-sm text-slate-500 mb-8">
        Your family&apos;s health history at a glance.
      </p>
      <IllnessList />
    </div>
  );
}
