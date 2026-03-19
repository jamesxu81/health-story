import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { IllnessWithCounts } from '@/types/illness';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const makeIllness = (name: string, id: string): IllnessWithCounts => ({
  id,
  user_id: 'u1',
  name,
  date_started: new Date(),
  date_ended: null,
  status: 'active',
  symptoms: [],
  cause: null,
  notes: null,
  created_at: new Date(),
  updated_at: new Date(),
  treatment_count: 0,
  photo_count: 0,
  recovery_days: null,
});

describe('QuickActions', () => {
  it('always shows Record sick day and Timeline tiles', () => {
    render(<QuickActions activeIllnesses={[]} />);
    expect(screen.getByText(/record sick day/i)).toBeInTheDocument();
    expect(screen.getByText(/timeline/i)).toBeInTheDocument();
  });

  it('shows Treat shortcut for active illnesses', () => {
    const illnesses = [makeIllness('Cold', 'i1')];
    render(<QuickActions activeIllnesses={illnesses} />);
    expect(screen.getByText(/treat cold/i)).toBeInTheDocument();
  });

  it('shows Family tile', () => {
    render(<QuickActions activeIllnesses={[]} />);
    expect(screen.getByText(/family/i)).toBeInTheDocument();
  });
});
