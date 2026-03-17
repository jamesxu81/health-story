/**
 * Unit Tests for TreatmentForm Component
 * Tests form submission, validation, and state management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreatmentForm } from '@/src/components/Forms/Treatment/TreatmentForm';
import { CreateTreatmentPayload, UpdateTreatmentPayload } from '@/types/treatment';

describe('TreatmentForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const testIllnessId = 'illness-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render form with all required fields', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/Treatment Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Treatment Type/i)).toBeInTheDocument();
      expect(screen.getByText(/Effectiveness Status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    });

    it('should render submit button with correct label for new treatment', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
        />
      );

      expect(screen.getByRole('button', { name: /Add Treatment/i })).toBeInTheDocument();
    });

    it('should render submit button with correct label for editing', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={true}
        />
      );

      expect(screen.getByRole('button', { name: /Update Treatment/i })).toBeInTheDocument();
    });

    it('should hide treatment type field when editing', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={true}
        />
      );

      expect(screen.queryByLabelText(/Treatment Type/i)).not.toBeInTheDocument();
    });

    it('should hide start date field when editing', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={true}
        />
      );

      expect(screen.queryByLabelText(/Start Date/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit with valid data', async () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/Treatment Name/i);
      const submitButton = screen.getByRole('button', { name: /Add Treatment/i });

      await userEvent.type(nameInput, 'Paracetamol 500mg');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should not submit with empty name', async () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Add Treatment/i });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/Treatment name is required/i)).toBeInTheDocument();
    });

    it('should validate end date is after start date', async () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/Treatment Name/i);
      const startDateInput = screen.getByLabelText(/Start Date/i) as HTMLInputElement;
      const endDateInput = screen.getByLabelText(/End Date/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Add Treatment/i });

      await userEvent.type(nameInput, 'Test');
      fireEvent.change(startDateInput, { target: { value: '2026-02-22T18:00' } });
      fireEvent.change(endDateInput, { target: { value: '2026-02-20T10:00' } });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/End date cannot be earlier/i)).toBeInTheDocument();
    });
  });

  describe('Effectiveness Options', () => {
    it('should display all effectiveness options', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3); // unknown, effective, ineffective
      expect(radios[0].getAttribute('value')).toBe('unknown');
      expect(radios[1].getAttribute('value')).toBe('effective');
      expect(radios[2].getAttribute('value')).toBe('ineffective');
    });

    it('should allow changing effectiveness', async () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const effectiveRadio = screen.getAllByRole('radio').find(r => r.getAttribute('value') === 'effective');
      expect(effectiveRadio).toBeDefined();
      if (effectiveRadio) {
        fireEvent.click(effectiveRadio);
        expect((effectiveRadio as HTMLInputElement).checked).toBe(true);
      }
    });
  });

  describe('Form State', () => {
    it('should populate form with initial data', () => {
      const initialData = {
        name: 'Aspirin',
        effectiveness: 'effective' as const,
        started_at: '2026-02-20T10:00',
      };

      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialData={initialData}
        />
      );

      expect((screen.getByLabelText(/Treatment Name/i) as HTMLInputElement).value).toBe(
        'Aspirin'
      );
    });

    it('should call onCancel when Cancel button is clicked', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should display loading state', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      const submitButton = buttons[0]; // Submit button is typically first
      expect((submitButton as HTMLButtonElement).disabled).toBe(true);
      expect(screen.getByText(/Saving/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display submission error', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Network error'));

      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/Treatment Name/i);
      const submitButton = screen.getByRole('button', { name: /Add Treatment/i });

      await userEvent.type(nameInput, 'Test');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should clear error on input change', async () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Add Treatment/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/Treatment name is required/i)).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/Treatment Name/i);
      await userEvent.type(nameInput, 'Test');

      expect(screen.queryByText(/Treatment name is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Treatment Type Options', () => {
    it('should have all treatment type options', () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const typeSelect = screen.getByLabelText(/Treatment Type/i) as HTMLSelectElement;
      expect(typeSelect.children).toHaveLength(4);
    });
  });

  describe('Notes Field', () => {
    it('should display notes character count', async () => {
      render(
        <TreatmentForm
          illnessId={testIllnessId}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const notesInput = screen.getByLabelText(/Notes/i);
      await userEvent.type(notesInput, 'Test notes');

      expect(screen.getByText(/10\/1000/)).toBeInTheDocument();
    });
  });
});
