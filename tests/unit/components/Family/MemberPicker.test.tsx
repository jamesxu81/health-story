import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberPicker } from '@/components/Family/MemberPicker';

const mockMembers = [
  { id: 'm1', user_id: 'u1', name: 'Emma', color: '#db2777', date_of_birth: null, relationship: 'child', created_at: new Date(), updated_at: new Date() },
  { id: 'm2', user_id: 'u1', name: 'Dad', color: '#2563eb', date_of_birth: null, relationship: 'self', created_at: new Date(), updated_at: new Date() },
];

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: mockMembers }),
  }) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('MemberPicker', () => {
  it('renders nothing while loading', () => {
    const { container } = render(
      <MemberPicker value={null} onChange={() => {}} />
    );
    // Immediately after render, it should be empty (loading state returns null)
    expect(container.querySelector('button')).toBeNull();
  });

  it('renders member buttons after fetch', async () => {
    render(<MemberPicker value={null} onChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });
    expect(screen.getByText('Dad')).toBeInTheDocument();
    expect(screen.getByText('Everyone')).toBeInTheDocument();
  });

  it('calls onChange with member id when clicked', async () => {
    const onChange = jest.fn();
    render(<MemberPicker value={null} onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText('Emma')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Emma'));
    expect(onChange).toHaveBeenCalledWith('m1');
  });

  it('calls onChange with null for Everyone', async () => {
    const onChange = jest.fn();
    render(<MemberPicker value="m1" onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText('Everyone')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Everyone'));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
