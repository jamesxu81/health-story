import { DashboardContent } from '@/components/Dashboard/DashboardContent';

export const metadata = {
  title: 'Dashboard - Health Story',
  description: 'Your family health overview at a glance',
};

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-1.5">
        Welcome back
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Here&apos;s how the family is doing.
      </p>
      <DashboardContent />
    </div>
  );
}
