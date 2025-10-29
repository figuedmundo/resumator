import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResumeEditorHeader from '../../../../pages/ResumeEditor/components/ResumeEditorHeader';

describe('ResumeEditorHeader', () => {
  const mockState = {
    id: '123',
    title: 'My Test Resume',
    saveStatus: 'saved',
    isSaving: false,
    viewMode: 'edit',
    versions: [],
    selectedVersionId: null,
    isDarkMode: false,
    showVersions: false,
    showUploadZone: false,
  };

  const mockHandlers = {
    navigate: vi.fn(),
    setTitle: vi.fn(),
    setViewMode: vi.fn(),
    setSelectedVersionId: vi.fn(),
    setShowVersions: vi.fn(),
    setIsDarkMode: vi.fn(),
    setShowUploadZone: vi.fn(),
    handleManualSave: vi.fn(),
  };

  const renderComponent = (state = mockState, handlers = mockHandlers) => {
    return render(
      <MemoryRouter>
        <ResumeEditorHeader state={state} handlers={handlers} />
      </MemoryRouter>
    );
  };

  it('renders the header with the correct title', () => {
    renderComponent();
    const titleInput = screen.getByPlaceholderText('Resume Title');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.value).toBe('My Test Resume');
  });

  it('calls the setTitle handler when the title input is changed', () => {
    renderComponent();
    const titleInput = screen.getByPlaceholderText('Resume Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(mockHandlers.setTitle).toHaveBeenCalledWith('New Title');
  });

  it('calls the setViewMode handler when the view mode buttons are clicked', () => {
    renderComponent();
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    expect(mockHandlers.setViewMode).toHaveBeenCalledWith('preview');

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(mockHandlers.setViewMode).toHaveBeenCalledWith('edit');
  });

  it('disables the save button when isSaving is true', () => {
    renderComponent({ ...mockState, isSaving: true });
    const saveButton = screen.getByText('Saving...').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('disables the save button when saveStatus is \'saved\'', () => {
    renderComponent({ ...mockState, saveStatus: 'saved' });
    const saveButton = screen.getByText('Save').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('calls handleManualSave when the save button is clicked', () => {
    renderComponent({ ...mockState, saveStatus: 'unsaved' });
    const saveButton = screen.getByText('Save').closest('button');
    fireEvent.click(saveButton);
    expect(mockHandlers.handleManualSave).toHaveBeenCalled();
  });
});
