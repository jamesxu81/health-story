import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SymptomInput } from '@/components/Forms/SymptomInput';
import { Symptom } from '@/types/illness';

describe('SymptomInput Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders symptom input form', () => {
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    expect(screen.getByText('Add Symptoms')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Symptom name (e.g., Cough, Fever, Headache)')
    ).toBeInTheDocument();
    expect(screen.getByText('Add Symptom')).toBeInTheDocument();
  });

  it('displays severity options as buttons', () => {
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    expect(screen.getByText('Mild')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('Severe')).toBeInTheDocument();
  });

  it('adds a symptom when form is submitted', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText('Symptom name (e.g., Cough, Fever, Headache)');
    const addButton = screen.getByText('Add Symptom');

    await user.type(nameInput, 'Headache');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      { name: 'Headache', severity: 'mild', duration: null },
    ]);
  });

  it('adds symptom with all fields', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText('Symptom name (e.g., Cough, Fever, Headache)');
    const durationInput = screen.getByPlaceholderText('Duration (e.g., 3 days)');
    const addButton = screen.getByText('Add Symptom');

    await user.type(nameInput, 'Fever');
    await user.click(screen.getByText('Severe'));
    await user.type(durationInput, '5 days');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      { name: 'Fever', severity: 'severe', duration: '5 days' },
    ]);
  });

  it('adds symptom when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText('Symptom name (e.g., Cough, Fever, Headache)');

    await user.type(nameInput, 'Cough');
    await user.keyboard('{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith([
      { name: 'Cough', severity: 'mild', duration: null },
    ]);
  });

  it('disables add button when name is empty', () => {
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const addButton = screen.getByText('Add Symptom');
    expect(addButton).toBeDisabled();
  });

  it('displays added symptoms as chips', () => {
    const symptoms: Symptom[] = [
      { name: 'Cough', severity: 'moderate', duration: '3 days' },
      { name: 'Fever', severity: 'severe', duration: null },
    ];

    render(<SymptomInput symptoms={symptoms} onChange={mockOnChange} />);

    expect(screen.getByText('Added Symptoms (2)')).toBeInTheDocument();
    expect(screen.getByText('Cough')).toBeInTheDocument();
    expect(screen.getByText('Fever')).toBeInTheDocument();
    expect(screen.getByText('(3 days)')).toBeInTheDocument();
  });

  it('removes symptom when × button is clicked', async () => {
    const user = userEvent.setup();
    const symptoms: Symptom[] = [
      { name: 'Cough', severity: 'moderate', duration: '3 days' },
      { name: 'Fever', severity: 'severe', duration: null },
    ];

    render(<SymptomInput symptoms={symptoms} onChange={mockOnChange} />);

    const removeButtons = screen.getAllByLabelText(/Remove/);
    await user.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith([
      { name: 'Fever', severity: 'severe', duration: null },
    ]);
  });

  it('clears input fields after adding symptom', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText(
      'Symptom name (e.g., Cough, Fever, Headache)'
    ) as HTMLInputElement;
    const durationInput = screen.getByPlaceholderText('Duration (e.g., 3 days)') as HTMLInputElement;
    const addButton = screen.getByText('Add Symptom');

    await user.type(nameInput, 'Headache');
    await user.click(screen.getByText('Moderate'));
    await user.type(durationInput, '2 days');
    await user.click(addButton);

    expect(nameInput.value).toBe('');
    expect(durationInput.value).toBe('');
  });

  it('trims whitespace from symptom names', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText('Symptom name (e.g., Cough, Fever, Headache)');
    const addButton = screen.getByText('Add Symptom');

    await user.type(nameInput, '  Headache  ');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      { name: 'Headache', severity: 'mild', duration: null },
    ]);
  });

  it('does not add empty symptoms', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const addButton = screen.getByText('Add Symptom');
    const nameInput = screen.getByPlaceholderText('Symptom name (e.g., Cough, Fever, Headache)');

    await user.type(nameInput, '   ');
    await user.click(addButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
