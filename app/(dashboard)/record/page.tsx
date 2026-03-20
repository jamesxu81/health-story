import { IllnessForm } from '@/components/Forms/IllnessForm';

export const metadata = {
  title: 'Record sick day - Health Story',
  description: 'Log how you or your family are feeling',
};

export default function RecordPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Record a sick day</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6 sm:mb-8">
        Note down what&apos;s going on so you can look back later.
      </p>
      <IllnessForm />
    </div>
  );
}
