import type { ReactElement } from 'react';

interface StatusStyle {
  bg: string;
  text: string;
  border: string;
  icon: ReactElement;
}

const iconProps = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none' as const, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const CheckIcon = ({ color }: { color: string }) => (
  <svg {...iconProps} stroke={color}><path d="M20 6 9 17l-5-5" /></svg>
);
const CrossIcon = ({ color }: { color: string }) => (
  <svg {...iconProps} stroke={color}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
const EyeIcon = ({ color }: { color: string }) => (
  <svg {...iconProps} stroke={color}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const ClockIcon = ({ color }: { color: string }) => (
  <svg {...iconProps} stroke={color}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);

const STATUS_STYLES: Record<string, StatusStyle> = {
  accepted:  { bg: '#e6faf0', text: '#0f7a4d', border: '#a8ecc9', icon: <CheckIcon color="#0f7a4d" /> },
  rejected:  { bg: '#fdedee', text: '#b42330', border: '#f6c1c6', icon: <CrossIcon color="#b42330" /> },
  reviewing: { bg: '#fef3e2', text: '#9a5b13', border: '#f8dba8', icon: <EyeIcon color="#9a5b13" /> },
  pending:   { bg: '#eef1f5', text: '#57616e', border: '#dbe1e8', icon: <ClockIcon color="#57616e" /> },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px 5px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 700,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {style.icon}
      {status}
    </span>
  );
}
