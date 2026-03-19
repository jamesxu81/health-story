import { FamilyMemberList } from '@/components/Family/FamilyMemberList';

export const metadata = {
  title: 'Family - Health Story',
  description: 'Manage family members to track health per person',
};

export default function FamilyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-1.5">Family</h1>
      <p className="text-sm text-slate-500 mb-8">
        Add the people you&apos;re keeping track of.
      </p>
      <FamilyMemberList />
    </div>
  );
}
