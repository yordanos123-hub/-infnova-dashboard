import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicants } from '../hooks/useApplicants';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useApplicationStatuses } from '../hooks/useApplicationStatuses';
import { StatCard } from '../components/StatCard';
import { SearchBar } from '../components/SearchBar';
import { ApplicantTable } from '../components/ApplicantTable';
import { Pagination } from '../components/Pagination';
import { ApplicantDetailsModal } from '../components/ApplicantDetailsModal';
import { UsersIcon, FileIcon, LayersIcon } from '../components/icons';
import type { Applicant, SortField, SortDirection } from '../types/applicant';
import { theme } from '../theme';
import { fetchCurrentAdmin, logout } from '../services/api';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  const { applicants, meta, loading, error, updatingId, refetch, updateStatus } =
    useApplicants(currentPage, searchTerm, sortField, sortDirection);
  const { summary } = useDashboardSummary();
  const statusOptions = useApplicationStatuses();

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchCurrentAdmin()
      .then(() => setCheckingSession(false))
      .catch(() => navigate('/?sessionExpired=1'));
  }, [navigate]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // reset to page 1 whenever the search changes
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // sorting reshuffles results, so start back at page 1
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus(id, status);
    // keep the modal's displayed applicant in sync with the update
    setSelectedApplicant(prev => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color.inkMuted, fontFamily: theme.font.body }}>
        Checking your session…
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.color.canvas, minHeight: '100vh', padding: '30px', fontFamily: theme.font.body }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ width: '4px', borderRadius: '2px', backgroundColor: theme.color.accent, alignSelf: 'stretch' }} />
            <div>
              <h1 style={{ color: theme.color.ink, margin: 0, fontFamily: theme.font.display, fontSize: '28px', fontWeight: 600 }}>
                Applicants Management
              </h1>
              <p style={{ color: theme.color.inkSoft, margin: '6px 0 0 0', fontSize: '14px' }}>
                Manage and track internship applications
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: theme.color.danger,
              border: `1px solid ${theme.color.dangerSoft}`,
              padding: '9px 18px',
              borderRadius: theme.radius.sm,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <StatCard title="Total applicants" value={summary?.total ?? meta.total ?? 0} accent={theme.color.accent} icon={<UsersIcon />} />
          <StatCard title="This page" value={applicants.length} accent="#0F7A4D" icon={<FileIcon />} />
          <StatCard title="Total pages" value={meta.totalPages || 0} accent="#9A5B13" icon={<LayersIcon />} />
        </div>

        <SearchBar value={searchTerm} onChange={handleSearchChange} />

        <ApplicantTable
          applicants={applicants}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onRowClick={setSelectedApplicant}
          onRetry={refetch}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          onChange={setCurrentPage}
        />
      </div>

      {selectedApplicant && (
        <ApplicantDetailsModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onStatusChange={handleStatusChange}
          updating={updatingId === selectedApplicant.id}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
};

export default Dashboard;
