'use client';

import React, { useState, useCallback } from 'react';
import { Symptom } from '@/types/illness';

interface SymptomInputProps {
  symptoms: Symptom[];
  onChange: (symptoms: Symptom[]) => void;
}

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', activeBg: 'bg-green-50 text-green-700 border-green-300', emoji: '😐' },
  { value: 'moderate', label: 'Moderate', activeBg: 'bg-amber-50 text-amber-700 border-amber-300', emoji: '😷' },
  { value: 'severe', label: 'Severe', activeBg: 'bg-red-50 text-red-700 border-red-300', emoji: '🤒' },
] as const;

const CHIP_COLORS: Record<string, string> = {
  mild: 'bg-green-50 text-green-700 border-green-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  severe: 'bg-red-50 text-red-700 border-red-200',
};

const inputClasses =
  'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors';

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
      {/* Add symptom card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-4 sm:p-6">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Add Symptoms
        </label>

        <div className="space-y-4">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Symptom name (e.g., Cough, Fever, Headache)"
            className={inputClasses}
            maxLength={100}
          />

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Severity
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SEVERITY_OPTIONS.map((opt) => {
                const isActive = severityInput === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSeverityInput(opt.value)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl border-2 transition-all min-h-[44px] ${
                      isActive
                        ? opt.activeBg + ' shadow-sm'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500'
                    }`}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <input
            type="text"
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            placeholder="Duration (e.g., 3 days)"
            className={inputClasses}
            maxLength={100}
          />
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleAddSymptom}
            disabled={!nameInput.trim()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors min-h-[44px]"
          >
            Add Symptom
          </button>
        </div>
      </div>

      {/* Symptom chips */}
      {symptoms.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 p-4 sm:p-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Added Symptoms ({symptoms.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-2 rounded-full text-xs font-medium border ${CHIP_COLORS[symptom.severity] || CHIP_COLORS.mild}`}
              >
                {symptom.name}
                {symptom.duration && (
                  <span className="text-[11px] opacity-60">({symptom.duration})</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveSymptom(index)}
                  className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center text-current ml-0.5"
                  aria-label={`Remove ${symptom.name}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
