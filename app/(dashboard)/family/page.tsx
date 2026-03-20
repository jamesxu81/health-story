import { FamilyMemberList } from '@/components/Family/FamilyMemberList';

export const metadata = {
  title: 'Family - Health Story',
  description: 'Manage family members to track health per person',
};

export default function FamilyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Family</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6 sm:mb-8">
        Add the people you&apos;re keeping track of.
      </p>
      <FamilyMemberList />
    </div>
  );
}
