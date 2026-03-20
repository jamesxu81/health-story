'use client';

import React from 'react';
import { Illness } from '@/types/illness';

interface IllnessDetailProps {
  illness: Illness & { treatments: any[]; photos: any[] };
  onEdit?: () => void;
}

export function IllnessDetail({ illness, onEdit }: IllnessDetailProps) {
  const isActive = illness.status === 'active';
  const dateRange = illness.date_ended
    ? `${new Date(illness.date_started).toLocaleDateString()} - ${new Date(illness.date_ended).toLocaleDateString()}`
    : `Started ${new Date(illness.date_started).toLocaleDateString()}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{illness.name}</h1>
            <p className="text-sm text-slate-400 mt-1">{dateRange}</p>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors min-h-[40px]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Edit
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className={`text-sm font-medium ${isActive ? 'text-red-600' : 'text-emerald-600'}`}>
            {isActive ? 'Active' : 'Resolved'}
          </span>
        </div>
      </div>

      {/* Cause */}
      {illness.cause && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4.5 h-4.5 text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </span>
            <h2 className="text-base font-semibold text-slate-900">Possible cause</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{illness.cause}</p>
        </div>
      )}

      {/* Symptoms */}
      {illness.symptoms && illness.symptoms.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4.5 h-4.5 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </span>
            <h2 className="text-base font-semibold text-slate-900">Symptoms</h2>
          </div>
          <div className="space-y-2.5">
            {illness.symptoms.map((symptom: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-slate-700 font-medium">{symptom.name}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                  symptom.severity === 'severe'
                    ? 'bg-red-50 text-red-600'
                    : symptom.severity === 'moderate'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-green-50 text-green-600'
                }`}>
                  {symptom.severity}
                </span>
                {symptom.duration && (
                  <span className="text-xs text-slate-400">{symptom.duration}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatments */}
      {illness.treatments && illness.treatments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4.5 h-4.5 text-violet-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </span>
            <h2 className="text-base font-semibold text-slate-900">Treatments</h2>
          </div>
          <div className="space-y-3">
            {illness.treatments.map((treatment: any) => (
              <div key={treatment.id} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm text-slate-700 font-medium">{treatment.type}</p>
                  {treatment.notes && (
                    <p className="text-xs text-slate-400 mt-0.5">{treatment.notes}</p>
                  )}
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap ${
                  treatment.effectiveness === 'effective'
                    ? 'bg-green-50 text-green-600'
                    : treatment.effectiveness === 'ineffective'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {treatment.effectiveness}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {illness.photos && illness.photos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {illness.photos.map((photo: any) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={photo.thumbnail_url || photo.url}
                  alt="Illness documentation"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {illness.notes && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4.5 h-4.5 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </span>
            <h2 className="text-base font-semibold text-slate-900">Notes</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{illness.notes}</p>
        </div>
      )}
    </div>
  );
}
