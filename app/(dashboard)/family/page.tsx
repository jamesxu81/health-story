import { FamilyMemberList } from '@/components/Family/FamilyMemberList';

export const metadata = {
  title: 'Family - Health Story',
  description: 'Manage family members to track health per person',
};

export default function FamilyPage() {
  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold text-vital-ink">Family</h1>
        <p className="text-sm text-vital-muted mt-1">
          Add the people you&apos;re keeping track of.
        </p>
      </div>
      <FamilyMemberList />
    </div>
  );
}
