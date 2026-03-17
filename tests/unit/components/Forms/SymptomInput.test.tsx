import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SymptomInput } from '@/src/components/Forms/SymptomInput';
import { Symptom } from '@/types/illness';

describe('SymptomInput Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders symptom input form', () => {
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    expect(screen.getByText('Add Symptoms')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Cough, Fever, Headache')).toBeInTheDocument();
    expect(screen.getByText('Add Symptom')).toBeInTheDocument();
  });

  it('displays severity options', () => {
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const severitySelect = screen.getByDisplayValue('Mild');
    expect(severitySelect).toBeInTheDocument();

    fireEvent.click(severitySelect);
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('Severe')).toBeInTheDocument();
  });

  it('adds a symptom when form is submitted', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText('e.g., Cough, Fever, Headache');
    const addButton = screen.getByText('Add Symptom');

    await user.type(nameInput, 'Headache');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        name: 'Headache',
        severity: 'mild',
        duration: null,
      },
    ]);
  });

  it('adds symptom with all fields', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText('e.g., Cough, Fever, Headache');
    const severitySelect = screen.getByDisplayValue('Mild');
    const durationInput = screen.getByPlaceholderText('e.g., 3 days');
    const addButton = screen.getByText('Add Symptom');

    await user.type(nameInput, 'Fever');
    await user.selectOptions(severitySelect, 'severe');
    await user.type(durationInput, '5 days');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        name: 'Fever',
        severity: 'severe',
        duration: '5 days',
      },
    ]);
  });

  it('adds symptom when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText('e.g., Cough, Fever, Headache');

    await user.type(nameInput, 'Cough');
    await user.keyboard('{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        name: 'Cough',
        severity: 'mild',
        duration: null,
      },
    ]);
  });

  it('disables add button when name is empty', () => {
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const addButton = screen.getByText('Add Symptom');
    expect(addButton).toBeDisabled();
  });

  it('displays added symptoms list', () => {
    const symptoms: Symptom[] = [
      { name: 'Cough', severity: 'moderate', duration: '3 days' },
      { name: 'Fever', severity: 'severe', duration: null },
    ];

    render(<SymptomInput symptoms={symptoms} onChange={mockOnChange} />);

    expect(screen.getByText('Added Symptoms (2)')).toBeInTheDocument();
    expect(screen.getByText('Cough')).toBeInTheDocument();
    expect(screen.getByText('Fever')).toBeInTheDocument();
    expect(screen.getByText('moderate')).toBeInTheDocument();
    expect(screen.getByText('severe')).toBeInTheDocument();
    expect(screen.getByText('3 days')).toBeInTheDocument();
  });

  it('removes symptom when remove button is clicked', async () => {
    const user = userEvent.setup();
    const symptoms: Symptom[] = [
      { name: 'Cough', severity: 'moderate', duration: '3 days' },
      { name: 'Fever', severity: 'severe', duration: null },
    ];

    render(<SymptomInput symptoms={symptoms} onChange={mockOnChange} />);

    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith([
      { name: 'Fever', severity: 'severe', duration: null },
    ]);
  });

  it('clears input fields after adding symptom', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText(
      'e.g., Cough, Fever, Headache'
    ) as HTMLInputElement;
    const severitySelect = screen.getByDisplayValue('Mild') as HTMLSelectElement;
    const durationInput = screen.getByPlaceholderText('e.g., 3 days') as HTMLInputElement;
    const addButton = screen.getByText('Add Symptom');

    await user.type(nameInput, 'Headache');
    await user.selectOptions(severitySelect, 'moderate');
    await user.type(durationInput, '2 days');
    await user.click(addButton);

    // Check inputs are cleared
    expect(nameInput.value).toBe('');
    expect(severitySelect.value).toBe('mild');
    expect(durationInput.value).toBe('');
  });

  it('trims whitespace from symptom names', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const nameInput = screen.getByPlaceholderText('e.g., Cough, Fever, Headache');
    const addButton = screen.getByText('Add Symptom');

    await user.type(nameInput, '  Headache  ');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        name: 'Headache',
        severity: 'mild',
        duration: null,
      },
    ]);
  });

  it('does not add empty symptoms', async () => {
    const user = userEvent.setup();
    render(<SymptomInput symptoms={[]} onChange={mockOnChange} />);

    const addButton = screen.getByText('Add Symptom');
    const nameInput = screen.getByPlaceholderText('e.g., Cough, Fever, Headache');

    // Try to add with only whitespace
    await user.type(nameInput, '   ');
    await user.click(addButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
