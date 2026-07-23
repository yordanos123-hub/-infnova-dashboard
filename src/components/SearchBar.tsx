import { theme } from '../theme';
import { SearchIcon, XIcon } from './icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
        <span
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.color.inkMuted,
            display: 'flex',
            pointerEvents: 'none',
          }}
        >
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search by name, email, or country..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search applicants"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 40px',
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.color.border}`,
            outline: 'none',
            fontSize: '15px',
            fontFamily: theme.font.body,
            color: theme.color.ink,
            background: theme.color.surface,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.color.accent;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.color.accentSoft}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.color.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: theme.color.inkMuted,
              display: 'flex',
              padding: '4px',
            }}
          >
            <XIcon />
          </button>
        )}
      </div>
    </div>
  );
}
