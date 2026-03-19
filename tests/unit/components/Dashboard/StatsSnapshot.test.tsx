import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsSnapshot, DashboardStats } from '@/components/Dashboard/StatsSnapshot';

const fullStats: DashboardStats = {
  total_illnesses: 12,
  active_count: 2,
  resolved_count: 10,
  this_month_count: 3,
  avg_recovery_days: 5,
  most_common_illness: { name: 'Cold', count: 4 },
};

describe('StatsSnapshot', () => {
  it('renders nothing when total is 0', () => {
    const empty: DashboardStats = { ...fullStats, total_illnesses: 0 };
    const { container } = render(<StatsSnapshot stats={empty} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders total recorded', () => {
    render(<StatsSnapshot stats={fullStats} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Total recorded')).toBeInTheDocument();
  });

  it('renders this month count', () => {
    render(<StatsSnapshot stats={fullStats} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('renders avg recovery days', () => {
    render(<StatsSnapshot stats={fullStats} />);
    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.getByText('Avg. recovery')).toBeInTheDocument();
  });

  it('renders most common illness', () => {
    render(<StatsSnapshot stats={fullStats} />);
    expect(screen.getByText('Cold')).toBeInTheDocument();
    expect(screen.getByText('Most common')).toBeInTheDocument();
  });

  it('omits avg recovery when null', () => {
    const noRecovery = { ...fullStats, avg_recovery_days: null };
    render(<StatsSnapshot stats={noRecovery} />);
    expect(screen.queryByText('Avg. recovery')).not.toBeInTheDocument();
  });

  it('omits most common when null', () => {
    const noCommon = { ...fullStats, most_common_illness: null };
    render(<StatsSnapshot stats={noCommon} />);
    expect(screen.queryByText('Most common')).not.toBeInTheDocument();
  });
});
