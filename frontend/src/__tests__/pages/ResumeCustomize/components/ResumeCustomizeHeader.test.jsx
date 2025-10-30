import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResumeCustomizeHeader from '../../../../pages/ResumeCustomize/components/ResumeCustomizeHeader';

describe('ResumeCustomizeHeader', () => {
  const mockState = {
    resume: { id: '123', title: 'My Resume' },
    viewMode: 'customize',
    hasChanges: false,
    versions: [],
    isLoading: false,
  };

  const mockHandlers = {
    navigate: vi.fn(),
    setViewMode: vi.fn(),
    setShowVersions: vi.fn(),
    handleDiscardCustomization: vi.fn(),
    handleSaveCustomization: vi.fn(),
    handleSaveAsApplication: vi.fn(),
  };

  const renderComponent = (state = mockState) => {
    return render(
      <MemoryRouter>
        <ResumeCustomizeHeader state={state} handlers={mockHandlers} />
      </MemoryRouter>
    );
  };

  it('renders the header with the correct title', () => {
    renderComponent();
    expect(screen.getByText('Customize: My Resume')).toBeInTheDocument();
  });

  it('calls setViewMode when view mode buttons are clicked', () => {
    renderComponent({ ...mockState, hasChanges: true });
    fireEvent.click(screen.getByText('Compare'));
    expect(mockHandlers.setViewMode).toHaveBeenCalledWith('compare');
  });

  it('disables compare and preview buttons when there are no changes', () => {
    renderComponent();
    expect(screen.getByText('Compare')).toBeDisabled();
    expect(screen.getByText('Preview')).toBeDisabled();
  });

  it('shows action buttons only when there are changes', () => {
    const { rerender } = renderComponent({ ...mockState, hasChanges: false });
    expect(screen.queryByText('Discard Changes')).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <ResumeCustomizeHeader state={{ ...mockState, hasChanges: true }} handlers={mockHandlers} />
      </MemoryRouter>
    );
    expect(screen.getByText('Discard Changes')).toBeInTheDocument();
  });
});
