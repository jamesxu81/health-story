import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IllnessForm } from '@/src/components/Forms/IllnessForm';

// Mock useRouter
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('IllnessForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders form with all required fields', () => {
    render(<IllnessForm />);

    expect(screen.getByLabelText('Illness Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Started *')).toBeInTheDocument();
    expect(screen.getByLabelText('Date Ended (if resolved)')).toBeInTheDocument();
    expect(screen.getByText('Add Symptoms')).toBeInTheDocument();
    expect(screen.getByLabelText('Likely Cause')).toBeInTheDocument();
    expect(screen.getByLabelText('Additional Notes')).toBeInTheDocument();
    expect(screen.getByText('Save Illness Record')).toBeInTheDocument();
  });

  it('sets today as default start date', () => {
    render(<IllnessForm />);

    const today = new Date().toISOString().split('T')[0];
    const startDateInput = screen.getByLabelText('Date Started *') as HTMLInputElement;

    expect(startDateInput.value).toBe(today);
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 'illness-123' },
      }),
    });

    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const submitButton = screen.getByText('Save Illness Record');

    await user.type(nameInput, 'Common Cold');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/illnesses',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('Common Cold'),
        })
      );
    });
  });

  it('shows error message on form submission failure', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Database error',
      }),
    });

    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const submitButton = screen.getByText('Save Illness Record');

    await user.type(nameInput, 'Flu');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });

  it('calls onSuccess callback when provided', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 'illness-456' },
      }),
    });

    render(<IllnessForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const submitButton = screen.getByText('Save Illness Record');

    await user.type(nameInput, 'Migraine');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('illness-456');
    });
  });

  it('redirects to history on successful submission without callback', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 'illness-789' },
      }),
    });

    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const submitButton = screen.getByText('Save Illness Record');

    await user.type(nameInput, 'Allergies');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/history');
    });
  });

  it('validates required name field', async () => {
    const user = userEvent.setup();
    render(<IllnessForm />);

    // Don't fill in the name field
    const submitButton = screen.getByText('Save Illness Record');

    // Try to submit without a name - should fail due to required HTML5 validation
    // The form will not submit, so we check that an error doesn't show
    // (because form submission is blocked by HTML5)
    const nameInput = screen.getByLabelText('Illness Name *') as HTMLInputElement;
    
    expect(nameInput).toHaveProperty('required', true);
    expect(nameInput.value).toBe('');
  });

  it('shows error when name is not provided', async () => {
    const user = userEvent.setup();
    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const submitButton = screen.getByText('Save Illness Record');

    // Fill in name then clear it - should trigger validation
    await user.type(nameInput, 'Test');
    await user.clear(nameInput);
    await user.type(nameInput, '   '); // Only whitespace

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Illness name is required')).toBeInTheDocument();
    });
  });

  it('handles Cancel button click', async () => {
    const user = userEvent.setup();
    render(<IllnessForm />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ data: { id: 'illness-999' } }),
              }),
            100
          )
        )
    );

    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const submitButton = screen.getByText('Save Illness Record') as HTMLButtonElement;

    await user.type(nameInput, 'Test Illness');
    await user.click(submitButton);

    // Button should be disabled while loading
    expect(submitButton).toBeDisabled();
  });

  it('trims input values before submitting', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 'illness-111' },
      }),
    });

    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const causeInput = screen.getByPlaceholderText('e.g., Exposure at work, Ate bad food');
    const submitButton = screen.getByText('Save Illness Record');

    await user.type(nameInput, '  Flu  ');
    await user.type(causeInput, '  Work exposure  ');
    await user.click(submitButton);

    await waitFor(() => {
      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
      expect(callBody.name).toBe('Flu');
      expect(callBody.cause).toBe('Work exposure');
    });
  });

  it('includes symptoms in form submission', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 'illness-222' },
      }),
    });

    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const symptomNameInput = screen.getByPlaceholderText('e.g., Cough, Fever, Headache');
    const addSymptomButton = screen.getByText('Add Symptom');
    const submitButton = screen.getByText('Save Illness Record');

    await user.type(nameInput, 'Cold');
    await user.type(symptomNameInput, 'Cough');
    await user.click(addSymptomButton);
    await user.click(submitButton);

    await waitFor(() => {
      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
      expect(callBody.symptoms).toHaveLength(1);
      expect(callBody.symptoms[0].name).toBe('Cough');
    });
  });

  it('converts empty strings to null for optional fields', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: 'illness-333' },
      }),
    });

    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const submitButton = screen.getByText('Save Illness Record');

    await user.type(nameInput, 'Infection');
    await user.click(submitButton);

    await waitFor(() => {
      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
      expect(callBody.cause).toBeNull();
      expect(callBody.notes).toBeNull();
      expect(callBody.date_ended).toBeNull();
    });
  });
});
