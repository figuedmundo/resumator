import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyState from '../../../components/common/EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="No Data" description="There is no data to display." />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('There is no data to display.')).toBeInTheDocument();
  });

  it('renders the icon when provided', () => {
    const icon = <svg data-testid="test-icon"></svg>;
    render(<EmptyState title="No Data" description="..." icon={icon} />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    const actions = <button>Click Me</button>;
    render(<EmptyState title="No Data" description="..." actions={actions} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
