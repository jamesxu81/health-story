'use client';

import React, { useState, useCallback } from 'react';
import { Symptom } from '@/types/illness';

interface SymptomInputProps {
  symptoms: Symptom[];
  onChange: (symptoms: Symptom[]) => void;
}

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', activeBg: 'bg-slate-100 text-slate-700 border-slate-300', emoji: '😐' },
  { value: 'moderate', label: 'Moderate', activeBg: 'bg-amber-50 text-amber-700 border-amber-300', emoji: '😷' },
  { value: 'severe', label: 'Severe', activeBg: 'bg-red-50 text-red-700 border-red-300', emoji: '🤒' },
] as const;

const CHIP_COLORS: Record<string, string> = {
  mild: 'bg-slate-100 text-slate-700 border-slate-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  severe: 'bg-red-50 text-red-700 border-red-200',
};

const inputClasses =
  'w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-[15px] text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors';

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
      <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
        <label className="block text-[13px] font-semibold text-slate-600 mb-4">
          Add Symptoms
        </label>

        <div className="space-y-5">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Symptom name (e.g., Cough, Fever, Headache)"
            className={inputClasses}
            maxLength={100}
          />

          {/* Severity segmented control */}
          <div>
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
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
                    className={`flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold rounded-xl border-2 transition-all min-h-[48px] ${
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

        <div className="mt-6">
          <button
            type="button"
            onClick={handleAddSymptom}
            disabled={!nameInput.trim()}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[14px] font-semibold rounded-xl transition-colors min-h-[48px]"
          >
            Add Symptom
          </button>
        </div>
      </div>

      {/* Symptom chips */}
      {symptoms.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <label className="block text-[13px] font-semibold text-slate-600 mb-3">
            Added Symptoms ({symptoms.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-2 rounded-full text-[13px] font-medium border ${CHIP_COLORS[symptom.severity] || CHIP_COLORS.mild}`}
              >
                {symptom.name}
                {symptom.duration && (
                  <span className="text-[11px] opacity-60">({symptom.duration})</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveSymptom(index)}
                  className="w-7 h-7 rounded-full hover:bg-black/10 flex items-center justify-center text-current ml-0.5"
                  aria-label={`Remove ${symptom.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
