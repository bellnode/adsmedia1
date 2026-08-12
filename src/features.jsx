import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const DEFAULT = { deposits: true, withdrawals: true, tasks: true, referral: true, tickets: true, plans: true };

const FeaturesContext = createContext({ features: DEFAULT, loading: true });

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/public/config')
      .then(d => setFeatures({ ...DEFAULT, ...(d.config?.features || {}) }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <FeaturesContext.Provider value={{ features, loading, refresh: () => api('/api/public/config').then(d => setFeatures({ ...DEFAULT, ...(d.config?.features || {}) })) }}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() { return useContext(FeaturesContext); }
