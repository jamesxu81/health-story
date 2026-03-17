'use client';

/**
 * SymptomInput Component
 * Dynamic form for adding/editing symptoms to an illness
 */

import React, { useState, useCallback } from 'react';
import { Symptom } from '@/types/illness';

interface SymptomInputProps {
  symptoms: Symptom[];
  onChange: (symptoms: Symptom[]) => void;
}

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
] as const;

export function SymptomInput({ symptoms, onChange }: SymptomInputProps) {
  const [nameInput, setNameInput] = useState('');
  const [severityInput, setSeverityInput] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [durationInput, setDurationInput] = useState('');

  const handleAddSymptom = useCallback(() => {
    if (!nameInput.trim()) return;

    const newSymptom: Symptom = {
      name: nameInput.trim(),
      severity: severityInput,
      duration: durationInput.trim() || null,
    };

    onChange([...symptoms, newSymptom]);

    // Reset inputs
    setNameInput('');
    setSeverityInput('mild');
    setDurationInput('');
  }, [nameInput, severityInput, durationInput, symptoms, onChange]);

  const handleRemoveSymptom = useCallback(
    (index: number) => {
      onChange(symptoms.filter((_, i) => i !== index));
    },
    [symptoms, onChange]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSymptom();
      }
    },
    [handleAddSymptom]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Add Symptoms</label>

        {/* Input form */}
        <div className="space-y-2 p-4 bg-white border border-slate-200 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Symptom Name *
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Symptom name (e.g., Cough, Fever, Headache)"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              minLength={1}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity</label>
              <select
                value={severityInput}
                onChange={(e) =>
                  setSeverityInput(e.target.value as 'mild' | 'moderate' | 'severe')
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
              <input
                type="text"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                placeholder="Duration (e.g., 3 days)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                maxLength={100}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddSymptom}
            disabled={!nameInput.trim()}
            className="w-full px-3 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white font-medium rounded-md text-sm transition-colors min-h-[44px]"
          >
            Add Symptom
          </button>
        </div>
      </div>

      {/* Symptoms list */}
      {symptoms.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Added Symptoms ({symptoms.length})
          </label>
          <div className="space-y-2">
            {symptoms.map((symptom, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{symptom.name}</p>
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
                <button
                  type="button"
                  onClick={() => handleRemoveSymptom(index)}
                  className="px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={`Remove ${symptom.name}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
