'use client';

import { IllnessList } from '@/components/Lists/IllnessList';
import { useFamilyFocus } from '@/context/FamilyFocusContext';

/** Remounts list when profile focus changes so pagination resets cleanly. */
export function TimelineListClient() {
  const focus = useFamilyFocus();
  const key = focus?.familyMemberId ?? 'everyone';
  return <IllnessList key={key} />;
}
