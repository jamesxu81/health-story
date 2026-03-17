import { IllnessForm } from '@/src/components/Forms/IllnessForm';

export const metadata = {
  title: 'Record New Illness - Health Story',
  description: 'Add a new illness record to your health history',
};

export default function RecordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Record New Illness</h1>
          <p className="mt-2 text-base text-slate-600">
            Document a new illness in your health history
          </p>
        </div>
      </div>

      {/* Form container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8">
          <IllnessForm />
        </div>
      </div>
    </div>
  );
}
