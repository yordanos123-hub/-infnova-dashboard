import { useEffect, useState } from 'react';
import type { Applicant } from '../types/applicant';
import { StatusBadge } from './StatusBadge';
import { XIcon } from './icons';
import { theme } from '../theme';
import api from '../services/api';

interface ApplicantDetailsModalProps {
  applicant: Applicant;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  updating: boolean;
  statusOptions: string[];
}

export function ApplicantDetailsModal({ applicant, onClose, onStatusChange, updating, statusOptions }: ApplicantDetailsModalProps) {
  // The list endpoint likely returns a lighter "summary" shape (per the
  // ApplicantSummary vs Applicant schemas in the docs), so fetch the full
  // record from GET /applicants/{id} when the modal opens.
  const [detail, setDetail] = useState<Applicant>(applicant);
  const [loadingDetail, setLoadingDetail] = useState(true);

  const [notes, setNotes] = useState(applicant.notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingDetail(true);
    api.get(`/applicants/${applicant.id}`)
      .then((response) => {
        if (cancelled) return;
        setDetail(response.data);
        setNotes(response.data.notes ?? '');
      })
      .catch((err) => {
        console.error('Failed to load full applicant detail, showing list data instead:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => { cancelled = true; };
  }, [applicant.id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      await api.patch(`/applicants/${applicant.id}/notes`, { notes: notes || null });
      setNotesSaved(true);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(22,26,43,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.color.surface, borderRadius: theme.radius.lg, padding: '30px',
          width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: theme.shadow.modal, fontFamily: theme.font.body,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <h2 style={{ margin: 0, color: theme.color.ink, fontFamily: theme.font.display, fontSize: '22px', fontWeight: 600 }}>
              {detail.fullName}
            </h2>
            <p style={{ margin: '5px 0 0 0', color: theme.color.inkSoft, fontSize: '14px' }}>{detail.email}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: 'none', background: theme.color.canvas, borderRadius: theme.radius.pill, width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: theme.color.inkMuted }}
          >
            <XIcon />
          </button>
        </div>

        {loadingDetail && (
          <p style={{ fontSize: '13px', color: theme.color.inkMuted, marginBottom: '14px' }}>Loading full details…</p>
        )}

        <DetailRow label="Track" value={detail.track} />
        <DetailRow label="Country" value={detail.country} />
        {detail.phone && <DetailRow label="Phone" value={detail.phone} />}
        {detail.appliedAt && (
          <DetailRow label="Applied" value={new Date(detail.appliedAt).toLocaleDateString()} />
        )}

        <div style={{ marginTop: '22px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: theme.color.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Status
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <StatusBadge status={detail.status} />
            <select
              value={detail.status}
              disabled={updating}
              onChange={(e) => {
                setDetail(prev => ({ ...prev, status: e.target.value }));
                onStatusChange(applicant.id, e.target.value);
              }}
              style={{
                padding: '8px 12px', borderRadius: theme.radius.sm, border: `1px solid ${theme.color.border}`,
                fontSize: '14px', fontFamily: theme.font.body, color: theme.color.ink,
                cursor: updating ? 'wait' : 'pointer',
              }}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {updating && <span style={{ fontSize: '13px', color: theme.color.inkMuted }}>Saving...</span>}
          </div>
        </div>

        <div style={{ marginTop: '22px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: theme.color.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Internal notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
            maxLength={1000}
            rows={4}
            placeholder="Add a note for the hiring team…"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 12px',
              borderRadius: theme.radius.sm, border: `1px solid ${theme.color.border}`,
              fontFamily: theme.font.body, fontSize: '14px', color: theme.color.ink,
              resize: 'vertical', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: theme.color.inkMuted }}>{notes.length}/1000</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {notesSaved && <span style={{ fontSize: '12px', color: '#0F7A4D', fontWeight: 600 }}>Saved</span>}
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{
                  padding: '7px 16px', borderRadius: theme.radius.sm, border: 'none',
                  background: theme.color.accent, color: 'white', fontWeight: 600, fontSize: '13px',
                  cursor: savingNotes ? 'wait' : 'pointer',
                }}
              >
                {savingNotes ? 'Saving…' : 'Save note'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${theme.color.border}` }}>
      <span style={{ color: theme.color.inkMuted, fontSize: '13px' }}>{label}</span>
      <span style={{ color: theme.color.ink, fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>{value}</span>
    </div>
  );
}
