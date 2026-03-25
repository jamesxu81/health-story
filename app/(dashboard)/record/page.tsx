import { IllnessForm } from '@/components/Forms/IllnessForm';

export const metadata = {
  title: 'Record sick day - Health Story',
  description: 'Log how you or your family are feeling',
};

export default function RecordPage() {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold text-vital-ink">Record a sick day</h1>
        <p className="text-sm text-vital-muted mt-1">
          Note down what&apos;s going on so you can look back later.
        </p>
      </div>
      <IllnessForm />
    </div>
  );
}
