"use client";

import { createContext, useContext, useState } from "react";

interface SelectedCompState {
  selectedCompId: string | null;
  setSelectedCompId: (id: string | null) => void;
}

const SelectedCompContext = createContext<SelectedCompState | null>(null);

/**
 * Shares the "selected comp" between the map and the comps list so clicking a
 * row highlights its marker (and vice-versa). Wraps the interactive part of the
 * dossier; client-only.
 */
export function SelectedCompProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  return (
    <SelectedCompContext.Provider value={{ selectedCompId, setSelectedCompId }}>
      {children}
    </SelectedCompContext.Provider>
  );
}

export function useSelectedComp(): SelectedCompState {
  const ctx = useContext(SelectedCompContext);
  // No-op fallback so a component used outside the provider doesn't crash.
  return ctx ?? { selectedCompId: null, setSelectedCompId: () => {} };
}
