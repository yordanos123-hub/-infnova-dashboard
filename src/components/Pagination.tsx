import type { CSSProperties } from 'react';
import { theme } from '../theme';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  const safeTotalPages = totalPages || 1;
  const disabledPrev = currentPage <= 1;
  const disabledNext = currentPage >= safeTotalPages;

  return (
    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
      <button disabled={disabledPrev} onClick={() => onChange(currentPage - 1)} style={buttonStyle(disabledPrev)}>
        Prev
      </button>
      <span style={{ fontWeight: 600, color: theme.color.inkSoft, fontFamily: theme.font.body, fontSize: '14px' }}>
        Page {currentPage} of {safeTotalPages}
      </span>
      <button disabled={disabledNext} onClick={() => onChange(currentPage + 1)} style={buttonStyle(disabledNext)}>
        Next
      </button>
    </div>
  );
}

function buttonStyle(disabled: boolean): CSSProperties {
  return {
    padding: '8px 18px',
    borderRadius: theme.radius.sm,
    border: `1px solid ${disabled ? theme.color.border : theme.color.accentSoftBorder}`,
    background: disabled ? theme.color.canvas : theme.color.surface,
    color: disabled ? theme.color.inkMuted : theme.color.accent,
    fontWeight: 600,
    fontSize: '14px',
    fontFamily: theme.font.body,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
