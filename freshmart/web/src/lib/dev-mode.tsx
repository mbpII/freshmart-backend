import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type DevModeContextValue = {
  isManager: boolean;
  setIsManager: (value: boolean) => void;
};

const DevModeContext = createContext<DevModeContextValue | null>(null);

const STORAGE_KEY = 'freshmart.dev.isManager';

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    setIsManager(saved === 'true');
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(isManager));
  }, [isManager]);

  const value = useMemo(() => ({ isManager, setIsManager }), [isManager]);

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
}

export function useDevMode() {
  const ctx = useContext(DevModeContext);
  if (!ctx) {
    throw new Error('useDevMode must be used within DevModeProvider');
  }
  return ctx;
}
