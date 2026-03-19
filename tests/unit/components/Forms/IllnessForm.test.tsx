import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IllnessForm } from '@/components/Forms/IllnessForm';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock('@/components/Family/MemberPicker', () => ({
  MemberPicker: () => null,
}));

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
    expect(screen.getByLabelText('Date Ended')).toBeInTheDocument();
    expect(screen.getByText('Add Symptoms')).toBeInTheDocument();
    expect(screen.getByLabelText('What might have caused it?')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes for your future self')).toBeInTheDocument();
    expect(screen.getByText('Save to timeline')).toBeInTheDocument();
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
      json: async () => ({ data: { id: 'illness-123' } }),
    });

    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    const submitButton = screen.getByText('Save to timeline');

    await user.type(nameInput, 'Common Cold');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/illnesses',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
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
      json: async () => ({ error: 'Database error' }),
    });

    render(<IllnessForm />);

    await user.type(screen.getByLabelText('Illness Name *'), 'Flu');
    await user.click(screen.getByText('Save to timeline'));

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
      json: async () => ({ data: { id: 'illness-456' } }),
    });

    render(<IllnessForm onSuccess={mockOnSuccess} />);

    await user.type(screen.getByLabelText('Illness Name *'), 'Migraine');
    await user.click(screen.getByText('Save to timeline'));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('illness-456');
    });
  });

  it('redirects to history on successful submission without callback', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'illness-789' } }),
    });

    render(<IllnessForm />);

    await user.type(screen.getByLabelText('Illness Name *'), 'Allergies');
    await user.click(screen.getByText('Save to timeline'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/history');
    });
  });

  it('shows error when name is not provided', async () => {
    const user = userEvent.setup();
    render(<IllnessForm />);

    const nameInput = screen.getByLabelText('Illness Name *');
    await user.type(nameInput, 'Test');
    await user.clear(nameInput);
    await user.type(nameInput, '   ');
    await user.click(screen.getByText('Save to timeline'));

    await waitFor(() => {
      expect(screen.getByText('name is required')).toBeInTheDocument();
    });
  });

  it('handles Cancel button click', async () => {
    const user = userEvent.setup();
    render(<IllnessForm />);

    await user.click(screen.getByText('Cancel'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: async () => ({ data: { id: 'illness-999' } }) }), 100)
        )
    );

    render(<IllnessForm />);

    const submitButton = screen.getByText('Save to timeline') as HTMLButtonElement;
    await user.type(screen.getByLabelText('Illness Name *'), 'Test Illness');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('trims input values before submitting', async () => {
    const user = userEvent.setup();
    const mockFetch = global.fetch as jest.Mock;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'illness-111' } }),
    });

    render(<IllnessForm />);

    await user.type(screen.getByLabelText('Illness Name *'), '  Flu  ');
    await user.type(
      screen.getByPlaceholderText('e.g., Exposure at school, Ate bad food'),
      '  Work exposure  '
    );
    await user.click(screen.getByText('Save to timeline'));

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
      json: async () => ({ data: { id: 'illness-222' } }),
    });

    render(<IllnessForm />);

    await user.type(screen.getByLabelText('Illness Name *'), 'Cold');
    await user.type(
      screen.getByPlaceholderText('Symptom name (e.g., Cough, Fever, Headache)'),
      'Cough'
    );
    await user.click(screen.getByText('Add Symptom'));
    await user.click(screen.getByText('Save to timeline'));

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
      json: async () => ({ data: { id: 'illness-333' } }),
    });

    render(<IllnessForm />);

    await user.type(screen.getByLabelText('Illness Name *'), 'Infection');
    await user.click(screen.getByText('Save to timeline'));

    await waitFor(() => {
      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as any).body);
      expect(callBody.cause).toBeNull();
      expect(callBody.notes).toBeNull();
      expect(callBody.date_ended).toBeNull();
    });
  });
});
