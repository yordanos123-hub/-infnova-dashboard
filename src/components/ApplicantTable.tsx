import type { Applicant, SortField, SortDirection } from '../types/applicant';
import { StatusBadge } from './StatusBadge';
import { theme } from '../theme';
import { SortIcon, ChevronUpIcon, ChevronDownIcon } from './icons';
import styles from './ApplicantTable.module.css';

interface ApplicantTableProps {
  applicants: Applicant[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onRowClick: (applicant: Applicant) => void;
  onRetry: () => void;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const COLUMNS: { label: string; field: SortField | null }[] = [
  { label: 'Applicant', field: 'fullName' },
  { label: 'Track', field: 'track' },
  { label: 'Country', field: 'country' },
  { label: 'Status', field: 'status' },
];

export function ApplicantTable({
  applicants, loading, error, searchTerm, onRowClick, onRetry,
  sortField, sortDirection, onSort,
}: ApplicantTableProps) {
  return (
    <div style={{ background: theme.color.surface, borderRadius: theme.radius.md, boxShadow: theme.shadow.card, border: `1px solid ${theme.color.border}`, overflow: 'hidden' }}>
      <table className={styles.responsiveTable} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: theme.color.canvas, borderBottom: `1px solid ${theme.color.border}` }}>
            {COLUMNS.map(({ label, field }) => {
              const isActive = field !== null && sortField === field;
              return (
                <th
                  key={label}
                  onClick={() => field && onSort(field)}
                  style={{
                    padding: '16px 20px',
                    color: isActive ? theme.color.accent : theme.color.inkMuted,
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontFamily: theme.font.body,
                    cursor: field ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    {label}
                    {field && (
                      <span style={{ display: 'inline-flex', opacity: isActive ? 1 : 0.35 }}>
                        {isActive
                          ? (sortDirection === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />)
                          : <SortIcon />}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading && <SkeletonRows />}

          {!loading && error && (
            <tr>
              <td colSpan={4} style={{ padding: '50px', textAlign: 'center' }}>
                <p style={{ color: theme.color.danger, margin: '0 0 12px 0', fontWeight: 600, fontFamily: theme.font.body }}>{error}</p>
                <button
                  onClick={onRetry}
                  style={{ padding: '8px 20px', borderRadius: theme.radius.sm, border: 'none', background: theme.color.accent, color: 'white', fontWeight: 600, fontFamily: theme.font.body, cursor: 'pointer' }}
                >
                  Retry
                </button>
              </td>
            </tr>
          )}

          {!loading && !error && applicants.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '50px', textAlign: 'center', color: theme.color.inkMuted, fontFamily: theme.font.body }}>
                {searchTerm ? `No applicants match "${searchTerm}".` : 'No applicants yet.'}
              </td>
            </tr>
          )}

          {!loading && !error && applicants.map((app) => (
            <tr
              key={app.id}
              onClick={() => onRowClick(app)}
              style={{ borderBottom: `1px solid ${theme.color.border}`, cursor: 'pointer', transition: 'background-color 0.12s' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.color.canvas)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td data-label="Applicant" style={{ padding: '14px 20px' }}>
                <div style={{ fontWeight: 600, color: theme.color.ink, fontFamily: theme.font.body, fontSize: '14px' }}>{app.fullName}</div>
                <div style={{ fontSize: '12.5px', color: theme.color.inkMuted, fontFamily: theme.font.body }}>{app.email}</div>
              </td>
              <td data-label="Track" style={{ padding: '14px 20px', color: theme.color.inkSoft, fontFamily: theme.font.body, fontSize: '14px', textTransform: 'capitalize' }}>{app.track}</td>
              <td data-label="Country" style={{ padding: '14px 20px', color: theme.color.inkSoft, fontFamily: theme.font.body, fontSize: '14px' }}>{app.country}</td>
              <td data-label="Status" style={{ padding: '14px 20px' }}>
                <StatusBadge status={app.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${theme.color.border}` }}>
          {COLUMNS.map((_, j) => (
            <td key={j} style={{ padding: '18px 20px' }}>
              <div className={styles.skeleton} style={{ height: '13px', borderRadius: '6px', background: theme.color.canvas, width: j === 0 ? '70%' : '50%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
