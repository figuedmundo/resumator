import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BaseCard from '../../../components/common/BaseCard';

describe('BaseCard', () => {
  it('renders children correctly', () => {
    render(<BaseCard>Body</BaseCard>);
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders header, body, and footer', () => {
    render(
      <BaseCard header={<div>Header</div>} footer={<div>Footer</div>}>
        Body
      </BaseCard>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies additional classNames', () => {
    const { container } = render(<BaseCard className="my-custom-class">Body</BaseCard>);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
