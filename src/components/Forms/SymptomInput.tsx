'use client';

import React, { useState, useCallback } from 'react';
import { Symptom } from '@/types/illness';

interface SymptomInputProps {
  symptoms: Symptom[];
  onChange: (symptoms: Symptom[]) => void;
}

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', activeBg: 'bg-vital-green-light text-vital-green border-vital-green', emoji: '😐' },
  { value: 'moderate', label: 'Moderate', activeBg: 'bg-vital-amber-light text-vital-amber border-vital-amber', emoji: '😷' },
  { value: 'severe', label: 'Severe', activeBg: 'bg-vital-red-light text-vital-red border-vital-red', emoji: '🤒' },
] as const;

const CHIP_COLORS: Record<string, string> = {
  mild: 'bg-vital-green-light text-vital-green border-vital-green/20',
  moderate: 'bg-vital-amber-light text-vital-amber border-vital-amber/20',
  severe: 'bg-vital-red-light text-vital-red border-vital-red/20',
};

const inputClasses =
  'w-full px-4 py-3 bg-white border border-black/10 rounded-[10px] text-sm text-vital-ink placeholder:text-vital-muted-2 focus:ring-2 focus:ring-vital-teal/20 focus:border-vital-teal transition-colors';

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
      <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
        <label className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-4">
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
            <span className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-2">
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
                    className={`flex items-center justify-center gap-1.5 py-2 text-[12px] font-semibold rounded-[10px] border-2 transition-all h-10 ${
                      isActive
                        ? opt.activeBg + ' shadow-sm'
                        : 'bg-white text-vital-muted-2 border-black/10 hover:border-black/20 hover:text-vital-muted'
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
            className="w-full py-3 bg-vital-teal hover:bg-vital-teal-hover active:opacity-95 disabled:bg-black/10 disabled:text-vital-muted-2 text-white text-[13px] font-medium rounded-lg transition-colors h-12"
          >
            Add Symptom
          </button>
        </div>
      </div>

      {symptoms.length > 0 && (
        <div className="bg-white rounded-[14px] border border-black/10 p-5 sm:p-6">
          <label className="block text-[11px] font-semibold text-vital-muted uppercase tracking-[0.4px] mb-3">
            Added Symptoms ({symptoms.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-2 rounded-full text-[12px] font-medium border ${CHIP_COLORS[symptom.severity] || CHIP_COLORS.mild}`}
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
