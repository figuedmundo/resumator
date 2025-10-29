import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Alert from '../../../components/common/Alert';

describe('Alert', () => {
  it('does not render when message is null', () => {
    const { container } = render(<Alert message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a success alert by default', () => {
    render(<Alert message="Success!" />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByTestId('alert-success')).toBeInTheDocument();
  });

  it('renders an error alert when variant is error', () => {
    render(<Alert variant="error" message="Error!" />);
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
  });
});
