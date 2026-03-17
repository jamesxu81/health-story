'use client';

/**
 * IllnessDetail Component
 * Displays full illness record with symptoms, cause, treatments, photos
 */

import React from 'react';
import { Illness } from '@/types/illness';

interface IllnessDetailProps {
  illness: Illness & {
    treatments: any[];
    photos: any[];
  };
}

export function IllnessDetail({ illness }: IllnessDetailProps) {
  const isActive = illness.status === 'active';
  const dateRange = illness.date_ended
    ? `${new Date(illness.date_started).toLocaleDateString()} - ${new Date(illness.date_ended).toLocaleDateString()}`
    : `Started ${new Date(illness.date_started).toLocaleDateString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{illness.name}</h1>
          <p className="text-slate-600 mt-1">{dateRange}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
            isActive
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {isActive ? 'Active' : 'Resolved'}
        </span>
      </div>

      {/* Cause section */}
      {illness.cause && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">Likely Cause</h2>
          <p className="text-blue-800">{illness.cause}</p>
        </div>
      )}

      {/* Symptoms section */}
      {illness.symptoms && illness.symptoms.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Symptoms</h2>
          <div className="space-y-2">
            {illness.symptoms.map((symptom: any, index: number) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-slate-900">{symptom.name}</p>
                <div className="flex gap-2 mt-1">
                  <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                    {symptom.severity}
                  </span>
                  {symptom.duration && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-slate-200 text-slate-600 rounded">
                      {symptom.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatments section */}
      {illness.treatments && illness.treatments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Treatments</h2>
          <div className="space-y-2">
            {illness.treatments.map((treatment: any) => (
              <div key={treatment.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{treatment.type}</p>
                    {treatment.notes && (
                      <p className="text-sm text-slate-600 mt-1">{treatment.notes}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap ${
                      treatment.effectiveness === 'effective'
                        ? 'bg-green-100 text-green-700'
                        : treatment.effectiveness === 'ineffective'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {treatment.effectiveness}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(treatment.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos section */}
      {illness.photos && illness.photos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {illness.photos.map((photo: any) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
              >
                <img
                  src={photo.thumbnail_url || photo.url}
                  alt="Illness documentation"
                  className="w-full h-full object-cover"
                />
                {photo.notes && (
                  <p className="text-xs text-slate-700 p-1 bg-white/90 truncate">
                    {photo.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes section */}
      {illness.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-amber-900 mb-2">Additional Notes</h2>
          <p className="text-amber-800 whitespace-pre-wrap">{illness.notes}</p>
        </div>
      )}
    </div>
  );
}
