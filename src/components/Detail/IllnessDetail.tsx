'use client';

import React, { useEffect, useState } from 'react';
import { Illness } from '@/types/illness';

function attachmentAuthHeaders(): HeadersInit {
  const t =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token') || 'default-user'
      : 'default-user';
  return { Authorization: `Bearer ${t}` };
}

/** Private Vercel Blob URLs are not usable in <img src>; fetch via API with auth. */
function RemoteAttachmentImage({ photoId, alt }: { photoId: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    let objUrl: string | null = null;
    (async () => {
      try {
        const r = await fetch(`/api/attachments/${photoId}`, {
          headers: attachmentAuthHeaders(),
          signal: ac.signal,
        });
        if (!r.ok) {
          setFailed(true);
          return;
        }
        const b = await r.blob();
        objUrl = URL.createObjectURL(b);
        setSrc(objUrl);
      } catch {
        if (!ac.signal.aborted) setFailed(true);
      }
    })();
    return () => {
      ac.abort();
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [photoId]);

  if (failed) {
    return (
      <div className="relative aspect-square rounded-[10px] overflow-hidden bg-vital-canvas flex items-center justify-center text-xs text-vital-muted px-2 text-center">
        Could not load image
      </div>
    );
  }
  if (!src) {
    return <div className="relative aspect-square rounded-[10px] overflow-hidden bg-vital-canvas animate-pulse" />;
  }
  return (
    <div className="relative aspect-square rounded-[10px] overflow-hidden bg-vital-canvas">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

function RemoveAttachmentButton({
  photoId,
  onRemoved,
}: {
  photoId: string;
  onRemoved?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const doDelete = async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/attachments/${photoId}`, {
        method: 'DELETE',
        headers: attachmentAuthHeaders(),
      });
      if (!r.ok) {
        let msg = 'Could not remove attachment';
        try {
          const j = await r.json();
          if (j?.error) msg = typeof j.error === 'string' ? j.error : msg;
        } catch {
          /* ignore */
        }
        window.alert(msg);
        return;
      }
      setConfirmOpen(false);
      onRemoved?.();
    } finally {
      setBusy(false);
    }
  };

  if (confirmOpen) {
    return (
      <div
        className="absolute top-2 right-2 z-30 flex flex-col items-end gap-1.5 rounded-[10px] border border-black/10 bg-white p-2 shadow-md"
        role="group"
        aria-label="Confirm remove attachment"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] text-vital-muted text-right max-w-[10rem] leading-snug">
          Remove this attachment?
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={busy}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-black/10 bg-white text-vital-ink hover:bg-vital-canvas"
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-vital-red text-white hover:opacity-90 disabled:opacity-50"
            onClick={() => void doDelete()}
          >
            {busy ? '…' : 'Remove'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      className="absolute top-2 right-2 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/95 text-vital-muted shadow-sm hover:bg-vital-red-light hover:text-vital-red hover:border-vital-red/20 transition-colors disabled:opacity-50"
      aria-label="Remove attachment"
      title="Remove attachment"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmOpen(true);
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

function RemotePdfButton({ photoId, filename }: { photoId: string; filename: string }) {
  const [busy, setBusy] = useState(false);

  const open = async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/attachments/${photoId}`, { headers: attachmentAuthHeaders() });
      if (!r.ok) return;
      const b = await r.blob();
      const u = URL.createObjectURL(b);
      window.open(u, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(u), 120_000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={busy}
      className="flex items-center gap-2 p-3 rounded-[10px] border border-black/10 bg-vital-canvas hover:bg-vital-canvas/80 transition-colors min-h-[52px] w-full text-left disabled:opacity-60"
    >
      <span
        className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-vital-amber-light text-vital-amber"
        aria-hidden
      >
        PDF
      </span>
      <span className="text-sm font-medium text-vital-ink truncate">
        {filename || 'PDF document'}
      </span>
    </button>
  );
}

interface IllnessDetailProps {
  illness: Illness & { treatments: any[]; photos: any[] };
  onEdit?: () => void;
  /** Called after an attachment is deleted (e.g. refetch illness). */
  onAttachmentRemoved?: () => void;
}

export function IllnessDetail({ illness, onEdit, onAttachmentRemoved }: IllnessDetailProps) {
  const isActive = illness.status === 'active';
  const dateRange = illness.date_ended
    ? `${new Date(illness.date_started).toLocaleDateString()} - ${new Date(illness.date_ended).toLocaleDateString()}`
    : `Started ${new Date(illness.date_started).toLocaleDateString()}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-vital-ink">{illness.name}</h1>
            <p className="text-sm text-vital-muted mt-1">{dateRange}</p>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-vital-teal bg-vital-teal-light hover:bg-vital-teal-light/80 rounded-lg transition-colors h-10 border border-vital-teal/20"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Edit
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            isActive ? 'bg-vital-red-light text-vital-red' : 'bg-vital-green-light text-vital-green'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-vital-red animate-pulse' : 'bg-vital-green'}`} />
            {isActive ? 'Active' : 'Resolved'}
          </span>
        </div>
      </div>

      {/* Cause */}
      {illness.cause && (
        <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-vital-amber-light flex items-center justify-center text-sm" aria-hidden>
              ⚠️
            </span>
            <h2 className="font-display text-[15px] font-semibold text-vital-ink">Possible cause</h2>
          </div>
          <p className="text-sm text-vital-ink/80 leading-relaxed">{illness.cause}</p>
        </div>
      )}

      {/* Treatment (free text on record) */}
      {illness.treat && (
        <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-vital-teal-light flex items-center justify-center text-sm" aria-hidden>
              🩹
            </span>
            <h2 className="font-display text-[15px] font-semibold text-vital-ink">Treatment</h2>
          </div>
          <p className="text-sm text-vital-ink/80 leading-relaxed whitespace-pre-wrap">{illness.treat}</p>
        </div>
      )}

      {/* Symptoms */}
      {illness.symptoms && illness.symptoms.length > 0 && (
        <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-vital-red-light flex items-center justify-center text-sm" aria-hidden>
              🩺
            </span>
            <h2 className="font-display text-[15px] font-semibold text-vital-ink">Symptoms</h2>
          </div>
          <div className="space-y-2.5">
            {illness.symptoms.map((symptom: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-vital-ink font-medium">{symptom.name}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                  symptom.severity === 'severe'
                    ? 'bg-vital-red-light text-vital-red'
                    : symptom.severity === 'moderate'
                      ? 'bg-vital-amber-light text-vital-amber'
                      : 'bg-vital-green-light text-vital-green'
                }`}>
                  {symptom.severity}
                </span>
                {symptom.duration && (
                  <span className="text-[12px] text-vital-muted">{symptom.duration}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatments */}
      {illness.treatments && illness.treatments.length > 0 && (
        <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-vital-purple-light flex items-center justify-center text-sm" aria-hidden>
              💊
            </span>
            <h2 className="font-display text-[15px] font-semibold text-vital-ink">Treatments</h2>
          </div>
          <div className="space-y-3">
            {illness.treatments.map((treatment: any) => (
              <div key={treatment.id} className="flex items-center justify-between gap-2 py-2.5 border-b border-black/5 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm text-vital-ink font-medium">{treatment.type}</p>
                  {treatment.notes && (
                    <p className="text-[12px] text-vital-muted mt-0.5">{treatment.notes}</p>
                  )}
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap ${
                  treatment.effectiveness === 'effective'
                    ? 'bg-vital-green-light text-vital-green'
                    : treatment.effectiveness === 'ineffective'
                      ? 'bg-vital-red-light text-vital-red'
                      : 'bg-vital-canvas text-vital-muted'
                }`}>
                  {treatment.effectiveness}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments (images, PDFs) */}
      {illness.photos && illness.photos.length > 0 && (
        <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-vital-blue-light flex items-center justify-center text-sm" aria-hidden>
              📷
            </span>
            <h2 className="font-display text-[15px] font-semibold text-vital-ink">Attachments</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {illness.photos.map((photo: any) => {
              const url = photo.thumbnail_url || photo.url || photo.blob_url;
              const isRemoteBlob = typeof url === 'string' && url.startsWith('http');
              const mime = String(photo.mime_type || '');
              const isPdf =
                mime === 'application/pdf' ||
                (typeof photo.filename === 'string' && photo.filename.toLowerCase().endsWith('.pdf'));
              const removeBtn =
                onAttachmentRemoved !== undefined ? (
                  <RemoveAttachmentButton photoId={photo.id} onRemoved={onAttachmentRemoved} />
                ) : null;

              if (isPdf) {
                if (isRemoteBlob) {
                  return (
                    <div key={photo.id} className="relative">
                      <RemotePdfButton
                        photoId={photo.id}
                        filename={photo.filename || 'PDF document'}
                      />
                      {removeBtn}
                    </div>
                  );
                }
                return (
                  <div key={photo.id} className="relative">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-[10px] border border-black/10 bg-vital-canvas hover:bg-vital-canvas/80 transition-colors min-h-[52px]"
                    >
                      <span
                        className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-vital-amber-light text-vital-amber"
                        aria-hidden
                      >
                        PDF
                      </span>
                      <span className="text-sm font-medium text-vital-ink truncate">
                        {photo.filename || 'PDF document'}
                      </span>
                    </a>
                    {removeBtn}
                  </div>
                );
              }
              if (isRemoteBlob) {
                return (
                  <div key={photo.id} className="relative">
                    <RemoteAttachmentImage
                      photoId={photo.id}
                      alt={photo.filename ? `Attachment: ${photo.filename}` : 'Illness documentation'}
                    />
                    {removeBtn}
                  </div>
                );
              }
              return (
                <div key={photo.id} className="relative">
                  <div className="relative aspect-square rounded-[10px] overflow-hidden bg-vital-canvas">
                    <img
                      src={url}
                      alt={photo.filename ? `Attachment: ${photo.filename}` : 'Illness documentation'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {removeBtn}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {illness.notes && (
        <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-vital-blue-light flex items-center justify-center text-sm" aria-hidden>
              📝
            </span>
            <h2 className="font-display text-[15px] font-semibold text-vital-ink">Notes</h2>
          </div>
          <p className="text-sm text-vital-ink/80 leading-relaxed whitespace-pre-wrap">{illness.notes}</p>
        </div>
      )}
    </div>
  );
}
