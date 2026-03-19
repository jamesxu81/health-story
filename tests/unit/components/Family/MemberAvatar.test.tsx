import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemberAvatar } from '@/components/Family/MemberAvatar';

describe('MemberAvatar', () => {
  it('renders initials from a single name', () => {
    render(<MemberAvatar name="Emma" color="#0d9488" />);
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('renders two initials from a full name', () => {
    render(<MemberAvatar name="Baby Leo" color="#2563eb" />);
    expect(screen.getByText('BL')).toBeInTheDocument();
  });

  it('applies the provided color as background', () => {
    const { container } = render(
      <MemberAvatar name="Mom" color="#db2777" />
    );
    const span = container.querySelector('span');
    expect(span).toHaveStyle({ backgroundColor: '#db2777' });
  });

  it('applies size class for sm', () => {
    const { container } = render(
      <MemberAvatar name="Dad" color="#0d9488" size="sm" />
    );
    const span = container.querySelector('span');
    expect(span?.className).toContain('w-7');
  });

  it('applies size class for lg', () => {
    const { container } = render(
      <MemberAvatar name="Dad" color="#0d9488" size="lg" />
    );
    const span = container.querySelector('span');
    expect(span?.className).toContain('w-12');
  });
});
