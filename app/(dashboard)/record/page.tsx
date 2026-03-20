import { IllnessForm } from '@/components/Forms/IllnessForm';

export const metadata = {
  title: 'Record sick day - Health Story',
  description: 'Log how you or your family are feeling',
};

export default function RecordPage() {
  return (
    <div className="max-w-2xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-1.5">Record a sick day</h1>
      <p className="text-sm text-slate-500 mb-8">
        Note down what&apos;s going on so you can look back later.
      </p>
      <IllnessForm />
    </div>
  );
}
