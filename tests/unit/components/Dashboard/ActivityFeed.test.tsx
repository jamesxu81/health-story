import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActivityFeed, ActivityEvent } from '@/components/Dashboard/ActivityFeed';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

const mockEvents: ActivityEvent[] = [
  {
    type: 'illness_created',
    title: 'Cold',
    illness_id: 'ill-1',
    illness_name: 'Cold',
    timestamp: today,
  },
  {
    type: 'treatment_added',
    title: 'Ibuprofen',
    illness_id: 'ill-1',
    illness_name: 'Cold',
    timestamp: yesterday,
  },
  {
    type: 'illness_resolved',
    title: 'Flu',
    illness_id: 'ill-2',
    illness_name: 'Flu',
    timestamp: yesterday,
  },
];

describe('ActivityFeed', () => {
  it('renders empty state when no events', () => {
    render(<ActivityFeed events={[]} hasMore={false} />);
    expect(screen.getByText(/all quiet lately/i)).toBeInTheDocument();
  });

  it('renders events with correct verbs', () => {
    render(<ActivityFeed events={mockEvents} hasMore={false} />);

    expect(screen.getByText(/Logged/)).toBeInTheDocument();
    expect(screen.getByText(/Treated/)).toBeInTheDocument();
    expect(screen.getByText(/Resolved/)).toBeInTheDocument();
  });

  it('shows relative timestamps', () => {
    render(<ActivityFeed events={mockEvents} hasMore={false} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getAllByText('Yesterday').length).toBeGreaterThan(0);
  });

  it('shows "View all in timeline" when hasMore is true', () => {
    render(<ActivityFeed events={mockEvents} hasMore={true} />);
    expect(screen.getByText(/view all in timeline/i)).toBeInTheDocument();
  });

  it('hides "View all" when hasMore is false', () => {
    render(<ActivityFeed events={mockEvents} hasMore={false} />);
    expect(screen.queryByText(/view all in timeline/i)).not.toBeInTheDocument();
  });
});
