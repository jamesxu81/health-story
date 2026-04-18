import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActiveIllnessCards } from '@/components/Dashboard/ActiveIllnessCards';
import { IllnessWithCounts } from '@/types/illness';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const makeIllness = (overrides: Partial<IllnessWithCounts> = {}): IllnessWithCounts => ({
  id: 'ill-1',
  user_id: 'u1',
  name: 'Cold',
  date_started: new Date(Date.now() - 2 * 86400000),
  date_ended: null,
  status: 'active',
  symptoms: [{ name: 'Cough', severity: 'mild', duration: null }],
  cause: null,
  treat: null,
  notes: null,
  created_at: new Date(),
  updated_at: new Date(),
  treatment_count: 1,
  photo_count: 0,
  recovery_days: null,
  ...overrides,
});

describe('ActiveIllnessCards', () => {
  it('renders nothing when no active illnesses', () => {
    const { container } = render(<ActiveIllnessCards illnesses={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders count header and illness cards', () => {
    const illnesses = [makeIllness(), makeIllness({ id: 'ill-2', name: 'Flu' })];
    render(<ActiveIllnessCards illnesses={illnesses} />);

    expect(screen.getByText('2 active sick days')).toBeInTheDocument();
    expect(screen.getByText('Cold')).toBeInTheDocument();
    expect(screen.getByText('Flu')).toBeInTheDocument();
  });

  it('uses singular label for 1 active illness', () => {
    render(<ActiveIllnessCards illnesses={[makeIllness()]} />);
    expect(screen.getByText('1 active sick day')).toBeInTheDocument();
  });

  it('shows "Still going?" nudge for illnesses older than 7 days', () => {
    const old = makeIllness({
      date_started: new Date(Date.now() - 10 * 86400000),
    });
    render(<ActiveIllnessCards illnesses={[old]} />);
    expect(
      screen.getByText(/still going\? you can mark it resolved/i)
    ).toBeInTheDocument();
  });

  it('does not show nudge for recent illnesses', () => {
    const recent = makeIllness({
      date_started: new Date(Date.now() - 1 * 86400000),
    });
    render(<ActiveIllnessCards illnesses={[recent]} />);
    expect(screen.queryByText(/still going/i)).not.toBeInTheDocument();
  });
});
