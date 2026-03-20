'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'health_story_focus_member';

export type FamilyFocusContextValue = {
  familyMemberId: string | null;
  setFamilyMemberId: (id: string | null) => void;
};

const FamilyFocusContext = createContext<FamilyFocusContextValue | undefined>(
  undefined
);

export function FamilyFocusProvider({ children }: { children: React.ReactNode }) {
  const [familyMemberId, setFamilyMemberIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFamilyMemberIdState(raw);
    } catch {
      /* ignore */
    }
  }, []);

  const setFamilyMemberId = useCallback((id: string | null) => {
    setFamilyMemberIdState(id);
    try {
      if (id === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ familyMemberId, setFamilyMemberId }),
    [familyMemberId, setFamilyMemberId]
  );

  return (
    <FamilyFocusContext.Provider value={value}>
      {children}
    </FamilyFocusContext.Provider>
  );
}

export function useFamilyFocus(): FamilyFocusContextValue | undefined {
  return useContext(FamilyFocusContext);
}
