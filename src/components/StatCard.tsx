import type { ReactNode } from 'react';
import { theme } from '../theme';

interface StatCardProps {
  title: string;
  value: number | string;
  accent: string;
  icon: ReactNode;
}

export function StatCard({ title, value, accent, icon }: StatCardProps) {
  return (
    <div
      style={{
        background: theme.color.surface,
        padding: '18px 20px',
        borderRadius: theme.radius.md,
        boxShadow: theme.shadow.card,
        border: `1px solid ${theme.color.border}`,
        flex: '1 1 180px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: theme.radius.sm,
          backgroundColor: `${accent}1A`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ color: theme.color.inkMuted, margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: theme.font.body }}>
          {title}
        </p>
        <h2 style={{ margin: 0, color: theme.color.ink, fontFamily: theme.font.display, fontSize: '26px', fontWeight: 600 }}>
          {value}
        </h2>
      </div>
    </div>
  );
}
