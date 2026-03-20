import { DashboardContent } from '@/components/Dashboard/DashboardContent';

export const metadata = {
  title: 'Dashboard - Health Story',
  description: 'Your family health overview at a glance',
};

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        Welcome back
      </h1>
      <p className="text-sm text-slate-500 mt-1 mb-6 sm:mb-8">
        Here&apos;s how the family is doing.
      </p>
      <DashboardContent />
    </div>
  );
}
