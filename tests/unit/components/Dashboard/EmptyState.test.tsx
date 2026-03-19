import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/Dashboard/EmptyState';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe('EmptyState', () => {
  it('renders the friendly message', () => {
    render(<EmptyState />);
    expect(screen.getByText(/everyone's feeling good/i)).toBeInTheDocument();
  });

  it('renders a link to record a sick day', () => {
    render(<EmptyState />);
    const link = screen.getByRole('link', { name: /record a sick day/i });
    expect(link).toHaveAttribute('href', '/record');
  });
});
