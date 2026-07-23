import { useEffect, useState } from 'react';
import api from '../services/api';

// The exact shape of /dashboard/summary isn't confirmed from the docs
// screenshots, so this is intentionally loose — every field optional,
// read defensively wherever it's used.
export interface DashboardSummary {
  total?: number;
  [key: string]: unknown;
}

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get('/dashboard/summary');
        if (!cancelled) setSummary(response.data);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { summary, loading };
}
