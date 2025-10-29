import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../../../components/common/Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  it('does not render if totalPages is 1 or less', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly and calls onPageChange', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={mockOnPageChange} />);

    const nextButtons = screen.getAllByText('Next');
    const prevButtons = screen.getAllByText('Previous');
    const page3Button = screen.getByText('3');

    expect(nextButtons.length).toBeGreaterThan(0);
    expect(prevButtons.length).toBeGreaterThan(0);
    expect(page3Button).toHaveAttribute('aria-current', 'page');

    fireEvent.click(nextButtons[0]);
    expect(mockOnPageChange).toHaveBeenCalledWith(4);

    fireEvent.click(prevButtons[0]);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);
    const prevButtons = screen.getAllByText('Previous');
    prevButtons.forEach(button => expect(button).toBeDisabled());
  });

  it('disables next button on last page', () => {
    render(<Pagination currentPage={10} totalPages={10} onPageChange={mockOnPageChange} />);
    const nextButtons = screen.getAllByText('Next');
    nextButtons.forEach(button => expect(button).toBeDisabled());
  });
});
