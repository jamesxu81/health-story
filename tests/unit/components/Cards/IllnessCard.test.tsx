import React from 'react';
import { render, screen } from '@testing-library/react';
import { IllnessCard } from '@/components/Cards/IllnessCard';
import { IllnessWithCounts } from '@/types/illness';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => children;
});

describe('IllnessCard Component', () => {
  const mockIllness: IllnessWithCounts = {
    id: 'ill-123',
    name: 'Common Cold',
    date_started: '2024-01-15',
    date_ended: '2024-01-18',
    status: 'resolved',
    symptoms: [
      { name: 'Cough', severity: 'moderate', duration: '3 days' },
      { name: 'Fever', severity: 'mild', duration: null },
    ],
    cause: 'Exposure at work',
    notes: 'Test note',
    treatment_count: 2,
    photo_count: 1,
  };

  it('renders illness card with name and date range', () => {
    render(<IllnessCard illness={mockIllness} />);

    const start = new Date(mockIllness.date_started).toLocaleDateString();
    const end = new Date(mockIllness.date_ended as string).toLocaleDateString();

    expect(screen.getByText('Common Cold')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${start}.*${end}`))).toBeInTheDocument();
  });

  it('displays active status badge correctly', () => {
    const activeIllness = { ...mockIllness, status: 'active' as const };
    render(<IllnessCard illness={activeIllness} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays resolved status badge correctly', () => {
    render(<IllnessCard illness={mockIllness} />);

    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('displays symptom count correctly', () => {
    render(<IllnessCard illness={mockIllness} />);

    expect(screen.getByText(/2 symptoms/)).toBeInTheDocument();
  });

  it('displays singular symptom label when count is 1', () => {
    const oneSymptomIllness = {
      ...mockIllness,
      symptoms: [{ name: 'Headache', severity: 'mild', duration: null }],
    };
    render(<IllnessCard illness={oneSymptomIllness} />);

    expect(screen.getByText(/1 symptom/)).toBeInTheDocument();
  });

  it('displays treatment count correctly', () => {
    render(<IllnessCard illness={mockIllness} />);

    expect(screen.getByText(/2 treatments/)).toBeInTheDocument();
  });

  it('displays photo count when present', () => {
    render(<IllnessCard illness={mockIllness} />);

    expect(screen.getByText(/1 photo/)).toBeInTheDocument();
  });

  it('does not display photo count when zero', () => {
    const noPhotosIllness = { ...mockIllness, photo_count: 0 };
    render(<IllnessCard illness={noPhotosIllness} />);

    expect(screen.queryByText(/photo/)).not.toBeInTheDocument();
  });

  it('displays cause when present', () => {
    render(<IllnessCard illness={mockIllness} />);

    expect(screen.getByText(/Maybe caused by: Exposure at work/)).toBeInTheDocument();
  });

  it('does not display cause when empty', () => {
    const noCauseIllness = { ...mockIllness, cause: null };
    render(<IllnessCard illness={noCauseIllness} />);

    expect(screen.queryByText(/Maybe caused by:/)).not.toBeInTheDocument();
  });

  it('displays started date only when no end date', () => {
    const activeIllness = { ...mockIllness, date_ended: null };
    render(<IllnessCard illness={activeIllness} />);

    const start = new Date(activeIllness.date_started).toLocaleDateString();
    expect(screen.getByText(new RegExp(`Started\\s+${start}`))).toBeInTheDocument();
  });
});
