import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CoverLetterEditorHeader from '../../../../pages/CoverLetters/components/CoverLetterEditorHeader';

describe('CoverLetterEditorHeader', () => {
  const mockState = {
    id: '123',
    title: 'My Test Cover Letter',
    isSaving: false,
    isDirty: true,
    viewMode: 'edit',
    versions: [],
    selectedVersionId: null,
    isDarkMode: false,
  };

  const mockHandlers = {
    navigate: vi.fn(),
    setTitle: vi.fn(),
    setViewMode: vi.fn(),
    setSelectedVersionId: vi.fn(),
    setIsDarkMode: vi.fn(),
    handleManualSave: vi.fn(),
  };

  const renderComponent = (state = mockState, handlers = mockHandlers) => {
    return render(
      <MemoryRouter>
        <CoverLetterEditorHeader state={state} handlers={handlers} />
      </MemoryRouter>
    );
  };

  it('renders the header with the correct title', () => {
    renderComponent();
    const titleInput = screen.getByPlaceholderText('Cover Letter Title');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.value).toBe('My Test Cover Letter');
  });

  it('calls the setTitle handler when the title input is changed', () => {
    renderComponent();
    const titleInput = screen.getByPlaceholderText('Cover Letter Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(mockHandlers.setTitle).toHaveBeenCalledWith('New Title');
  });

  it('disables the save button when isSaving is true', () => {
    renderComponent({ ...mockState, isSaving: true });
    const saveButton = screen.getByText('Saving...').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('disables the save button when isDirty is false', () => {
    renderComponent({ ...mockState, isDirty: false });
    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('calls handleManualSave when the save button is clicked', () => {
    renderComponent();
    const saveButton = screen.getByText('Save').closest('button');
    fireEvent.click(saveButton);
    expect(mockHandlers.handleManualSave).toHaveBeenCalled();
  });
});
