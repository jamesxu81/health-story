import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { IllnessList } from '@/components/Lists/IllnessList';
import { IllnessWithCounts } from '@/types/illness';

jest.mock('next/link', () => {
  return ({ children, href }: any) => children;
});

jest.mock('@/components/Cards/IllnessCard', () => ({
  IllnessCard: ({ illness }: any) => <div data-testid="illness-card">{illness.name}</div>,
}));

global.fetch = jest.fn();

describe('IllnessList Component', () => {
  const mockIllnesses: IllnessWithCounts[] = [
    {
      id: 'ill-1',
      name: 'Cold',
      date_started: '2024-01-15',
      date_ended: '2024-01-18',
      status: 'resolved',
      symptoms: [{ name: 'Cough', severity: 'mild', duration: null }],
      cause: null,
      notes: null,
      treatment_count: 0,
      photo_count: 0,
    },
    {
      id: 'ill-2',
      name: 'Flu',
      date_started: '2024-01-20',
      date_ended: null,
      status: 'active',
      symptoms: [],
      cause: 'Work',
      notes: null,
      treatment_count: 2,
      photo_count: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], pagination: { total: 0 } }),
    });
  });

  it('renders illness cards when provided', () => {
    render(<IllnessList initialData={mockIllnesses} totalCount={2} />);

    const cards = screen.getAllByTestId('illness-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Cold')).toBeInTheDocument();
    expect(screen.getByText('Flu')).toBeInTheDocument();
  });

  it('shows pagination when multiple pages', () => {
    render(<IllnessList initialData={mockIllnesses} totalCount={25} />);

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<IllnessList initialData={mockIllnesses} totalCount={25} />);

    const previousBtn = screen.getByText('← Previous') as HTMLButtonElement;
    expect(previousBtn.disabled).toBe(true);
  });

  it('shows next button when more pages available', () => {
    render(<IllnessList initialData={mockIllnesses} totalCount={25} />);

    const nextBtn = screen.getByText('Next →');
    expect(nextBtn).toBeInTheDocument();
  });

  it('shows empty state when no illnesses', async () => {
    render(<IllnessList initialData={[]} totalCount={0} />);

    await waitFor(() => {
      expect(screen.getByText(/No illnesses recorded yet/)).toBeInTheDocument();
    });
  });

  it('shows empty state for active filter', async () => {
    render(<IllnessList initialData={[]} totalCount={0} status="active" />);

    await waitFor(() => {
      expect(screen.getByText(/No active illnesses recorded/)).toBeInTheDocument();
    });
  });

  it('shows empty state for resolved filter', async () => {
    render(<IllnessList initialData={[]} totalCount={0} status="resolved" />);

    await waitFor(() => {
      expect(screen.getByText(/No resolved illnesses recorded/)).toBeInTheDocument();
    });
  });

  it('hides pagination with single page', () => {
    render(<IllnessList initialData={mockIllnesses} totalCount={2} />);

    expect(screen.queryByText('← Previous')).not.toBeInTheDocument();
  });
});
