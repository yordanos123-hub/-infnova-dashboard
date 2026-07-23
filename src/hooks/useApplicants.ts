import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import type { Applicant, ApplicantsMeta, SortField, SortDirection } from '../types/applicant';

interface UseApplicantsResult {
  applicants: Applicant[];
  meta: ApplicantsMeta;
  loading: boolean;
  error: string | null;
  updatingId: string | null;
  refetch: () => void;
  updateStatus: (id: string, status: string) => Promise<void>;
}

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 10; // matches the API's default page size

export function useApplicants(
  page: number,
  searchTerm: string,
  sortField: SortField | null,
  sortDirection: SortDirection
): UseApplicantsResult {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [meta, setMeta] = useState<ApplicantsMeta>({ total: 0, totalPages: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const requestId = useRef(0);
  // Caches every applicant across all pages, fetched once, so search and
  // sort can both work locally across every field without depending on
  // which query params the backend actually supports.
  const allApplicantsCache = useRef<Applicant[] | null>(null);

  const fetchAllApplicants = useCallback(async (): Promise<Applicant[]> => {
    if (allApplicantsCache.current) return allApplicantsCache.current;

    const first = await api.get('/applicants', { params: { page: 1 } });
    const firstPageData: Applicant[] = first.data.data || [];
    const totalPages: number = first.data.meta?.totalPages || 1;

    const remainingPages = await Promise.all(
      Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) =>
        api.get('/applicants', { params: { page: i + 2 } })
      )
    );

    const all = [
      ...firstPageData,
      ...remainingPages.flatMap((res) => res.data.data || []),
    ];
    allApplicantsCache.current = all;
    return all;
  }, []);

  const applySort = useCallback((list: Applicant[]): Applicant[] => {
    if (!sortField) return list;
    const dir = sortDirection === 'asc' ? 1 : -1;
    return [...list].sort((a, b) =>
      a[sortField].toString().toLowerCase().localeCompare(b[sortField].toString().toLowerCase()) * dir
    );
  }, [sortField, sortDirection]);

 
  const runLocal = useCallback(async (pageToShow: number, term: string) => {
    const thisRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const all = await fetchAllApplicants();
      if (thisRequest !== requestId.current) return;

      const q = term.trim().toLowerCase();
      const filtered = q
        ? all.filter((a) =>
            a.fullName.toLowerCase().includes(q) ||
            a.email.toLowerCase().includes(q) ||
            a.country.toLowerCase().includes(q) ||
            a.track.toLowerCase().includes(q)
          )
        : all;

      const sorted = applySort(filtered);

      const totalPages = Math.max(Math.ceil(sorted.length / PAGE_SIZE), 1);
      const safePage = Math.min(pageToShow, totalPages);
      const start = (safePage - 1) * PAGE_SIZE;

      setApplicants(sorted.slice(start, start + PAGE_SIZE));
      setMeta({ total: sorted.length, totalPages, page: safePage });
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      console.error('Failed to load applicants:', err);
      setError('Could not load applicants. Check your connection and try again.');
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  }, [fetchAllApplicants, applySort]);

  const fetchPage = useCallback(async (pageToFetch: number) => {
    const thisRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/applicants', { params: { page: pageToFetch } });
      if (thisRequest !== requestId.current) return;
      setApplicants(response.data.data || []);
      setMeta(response.data.meta || { total: 0, totalPages: 0, page: pageToFetch });
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      console.error('Failed to load applicants:', err);
      setError('Could not load applicants. Check your connection and try again.');
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  }, []);

  const needsLocalMode = searchTerm.trim() !== '' || sortField !== null;

  useEffect(() => {
    const hasSearch = searchTerm.trim() !== '';
    const timer = setTimeout(() => {
      if (needsLocalMode) {
        runLocal(page, searchTerm);
      } else {
        fetchPage(page);
      }
    }, hasSearch ? DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [page, searchTerm, sortField, sortDirection, needsLocalMode, runLocal, fetchPage]);

  const refetch = useCallback(() => {
    allApplicantsCache.current = null; // force a fresh fetch, data may have changed
    if (needsLocalMode) {
      runLocal(page, searchTerm);
    } else {
      fetchPage(page);
    }
  }, [page, searchTerm, needsLocalMode, runLocal, fetchPage]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    const previous = applicants;
    setUpdatingId(id);
    setApplicants(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
    if (allApplicantsCache.current) {
      allApplicantsCache.current = allApplicantsCache.current.map(a =>
        a.id === id ? { ...a, status } : a
      );
    }
    try {
      await api.patch(`/applicants/${id}/status`, { status });
    } catch (err) {
      console.error('Failed to update status:', err);
      setApplicants(previous);
      setError('Could not update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }, [applicants]);

  return { applicants, meta, loading, error, updatingId, refetch, updateStatus };
}