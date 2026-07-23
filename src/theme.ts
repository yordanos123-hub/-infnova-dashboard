export const theme = {
  color: {
    ink: '#161A2B',          
    inkSoft: '#4B5169',      
    inkMuted: '#9297AA',     
    canvas: '#F5F6FA',       
    surface: '#FFFFFF',      
    border: '#E6E8F0',
    accent: '#4F46E5',       
    accentSoft: '#EEF0FE',
    accentSoftBorder: '#D6D9FA',
    danger: '#DC2626',
    dangerSoft: '#FDEDEE',
  },
  font: {
    display: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
    body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    pill: '999px',
  },
  shadow: {
    card: '0 1px 2px rgba(22,26,43,0.04), 0 8px 24px rgba(22,26,43,0.06)',
    modal: '0 24px 60px rgba(22,26,43,0.22)',
  },
} as const;
