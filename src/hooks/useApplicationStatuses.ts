import { useEffect, useState } from 'react';
import api from '../services/api';

const FALLBACK_STATUSES = ['pending', 'reviewing', 'accepted', 'rejected'];

export function useApplicationStatuses() {
  const [statuses, setStatuses] = useState<string[]>(FALLBACK_STATUSES);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await api.get('/application-statuses');
        // Accept either a plain string array or an array of { value } objects,
        // since the exact response shape isn't confirmed.
        const raw = response.data;
        const list: string[] = Array.isArray(raw)
          ? raw.map((item: unknown) => (typeof item === 'string' ? item : (item as any)?.value ?? (item as any)?.name)).filter(Boolean)
          : FALLBACK_STATUSES;
        if (!cancelled && list.length > 0) setStatuses(list);
      } catch (err) {
        console.error('Failed to load application statuses, using fallback list:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return statuses;
}
