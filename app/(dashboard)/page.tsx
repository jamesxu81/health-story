import { DashboardContent } from '@/components/Dashboard/DashboardContent';

export const metadata = {
  title: 'Dashboard - Health Story',
  description: 'Your family health overview at a glance',
};

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold text-vital-ink">
          Welcome back
        </h1>
        <p className="text-sm text-vital-muted mt-1">
          Here&apos;s how the family is doing.
        </p>
      </div>
      <DashboardContent />
    </div>
  );
}
