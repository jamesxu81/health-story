import { IllnessList } from '@/src/components/Lists/IllnessList';

export const metadata = {
  title: 'Illness History - Health Story',
  description: 'View your complete health history and past illness records',
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Illness History</h1>
          <p className="mt-2 text-base text-slate-600">
            View and manage all your recorded illnesses
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IllnessList />
      </div>
    </div>
  );
}
